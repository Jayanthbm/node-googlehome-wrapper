const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const { URL } = require("url");
const querystring = require("querystring");
const GoogleAssistant = require("google-assistant");
const axios = require("axios");
const cheerio = require("cheerio");
var cors = require('cors')
const PORT = 2424;

// Load credentials
const credentials = require("./credentials.json");

// Define configuration
const config = {
  auth: {
    keyFilePath: path.resolve(__dirname, "./credentials.json"),
    savedTokensPath: path.resolve(__dirname, "./tokens.json"),
  },
  conversation: {
    lang: "en-US",
    showDebugInfo: false,
    screen: {
      isOn: true, // set this to true if you want to output results to a screen
    },
  },
};

// Helper function to load tokens from file
const loadTokensFromFile = () => {
  if (fs.existsSync(config.auth.savedTokensPath)) {
    try {
      const tokensData = fs.readFileSync(config.auth.savedTokensPath);
      return JSON.parse(tokensData);
    } catch (error) {
      console.error("Error loading tokens from file:", error);
      return {};
    }
  }
  return {};
};

// Load tokens from the file initially
let tokens = loadTokensFromFile();

// Create an instance of Google Assistant
const assistant = new GoogleAssistant(config.auth);

// Function to check if access token is expired
const isTokenExpired = () => {
  if (!tokens.access_token || !tokens.expires_at) {
    return true;
  }
  const now = Date.now();
  return now >= tokens.expires_at;
};

// Function to refresh access token using refresh token
const refreshAccessToken = async () => {
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      refresh_token: tokens.refresh_token,
      client_id: credentials.web.client_id,
      client_secret: credentials.web.client_secret,
      grant_type: "refresh_token",
    });

    tokens.access_token = response.data.access_token;
    tokens.expires_at = Date.now() + response.data.expires_in * 1000; // Convert seconds to milliseconds
    fs.writeFileSync(config.auth.savedTokensPath, JSON.stringify(tokens));
    console.log("Access token refreshed successfully.");

    // Reload tokens from the file to ensure they are in sync
    tokens = loadTokensFromFile();

  } catch (error) {
    console.error(
      "Error refreshing access token:",
      error.response?.data || error,
    );
    throw new Error("Error refreshing access token.");
  }
};

// Middleware to parse JSON request body
app.use(express.json());

app.use(cors())

// Helper function to generate Google OAuth URL
const getOAuthUrl = () => {
  const params = {
    client_id: credentials.web.client_id,
    redirect_uri: `http://localhost:${PORT}/auth/handler`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/assistant-sdk-prototype",
    access_type: "offline",
  };
  const url = new URL("https://accounts.google.com/o/oauth2/auth");
  url.search = querystring.stringify(params);
  return url.toString();
};

// Root URL
app.get("/", (req, res) => {
  res.status(200).send("Welcome to root URL of Server");
});

// Start OAuth process
app.get("/auth/start", async (req, res) => {
  const authUrl = getOAuthUrl();
  try {
    const { default: open } = await import("open"); // Dynamically import the open module
    await open(authUrl); // Open the default browser to start the authentication
    res
      .status(200)
      .send(`Please authorize the application by visiting: ${authUrl}`);
  } catch (error) {
    console.error("Error opening browser:", error);
    res.status(500).send("Error opening browser.");
  }
});

// OAuth handler
app.get("/auth/handler", async (req, res) => {
  const { query } = req;
  const authCode = query.code;

  if (authCode) {
    try {
      // Exchange authorization code for tokens
      const tokenUrl = "https://oauth2.googleapis.com/token";
      const response = await axios.post(tokenUrl, {
        code: authCode,
        client_id: credentials.web.client_id,
        client_secret: credentials.web.client_secret,
        redirect_uri: `http://localhost:${PORT}/auth/handler`,
        grant_type: "authorization_code",
      });

      tokens = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: Date.now() + response.data.expires_in * 1000, // Convert seconds to milliseconds
      };

      fs.writeFileSync(config.auth.savedTokensPath, JSON.stringify(tokens));
      console.log("Tokens updated successfully.");
      res.status(200).send("Tokens updated successfully!");
    } catch (error) {
      console.error("Error updating tokens:", error.response?.data || error);
      res.status(500).send("Error updating tokens.");
    }
  } else {
    res.status(400).send("No authorization code provided.");
  }
});

// Function to start a conversation with Google Assistant
const startConversation = async (query) => {
  // Check if access token is expired or near expiry
  if (isTokenExpired()) {
    try {
      await refreshAccessToken();
    } catch (error) {
      throw new Error("Error refreshing access token.");
    }
  }

  let tokens = loadTokensFromFile();
  // Always use the latest tokens
  config.auth.tokens = tokens;

  return new Promise((resolve, reject) => {
    assistant.start(
      { ...config.conversation, textQuery: query },
      (conversation) => {
        let assistantResponse = ""; // Variable to hold assistant response

        // Event listeners for Google Assistant responses
        conversation
          .on("screen-data", (screen) => {
            // Parse HTML using cheerio
            const htmlString = screen.data.toString();
            const $ = cheerio.load(htmlString);
            const showTextContent = $(".show_text_content").text(); // Extract text from elements with class 'show_text_content'
            assistantResponse = showTextContent.trim(); // Store the response
            console.log("Query:", query);
            console.log("Assistant Response:", assistantResponse);
          })
          .on("ended", (error, continueConversation) => {
            if (error) {
              console.error("Conversation Ended Error:", error);
              reject({ error: "Conversation ended with error" });
            } else if (continueConversation) {
              // Follow-up logic if needed
              console.log("Continue conversation");
            } else {
              console.log("Conversation Complete");
              resolve({ response: assistantResponse }); // Resolve with the final response
              conversation.end(); // End the conversation
            }
          })
          .on("error", (error) => {
            console.error("Conversation Error:", error?.details ? error.details : error);
            if (error?.code == 16) {
              reject({ error: "Not Authorized" });
            } else {
              reject({ error: "Conversation error occurred" });
            }

          });
      }
    );
  });
};

// Endpoint to handle query requests
app.post("/query", async (req, res) => {
  const { query } = req.body;

  try {
    const result = await startConversation(query);
    res.json(result); // Send the final response back to client
  } catch (error) {
    console.error("Error in conversation:", error);
    if(error?.error == "Not Authorized"){
      res.status(401).json({ error: "Not Authorized" });
    } else {
      res.status(500).json(error);
    }

  }
});

// Start the server
app.listen(PORT, (error) => {
  if (!error) {
    console.log(
      `Server is Successfully Running, and App is listening on port ${PORT}`,
    );
  } else {
    console.error("Error occurred, server can't start", error);
  }
});
