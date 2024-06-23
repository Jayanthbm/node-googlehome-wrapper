import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaCog, FaMoon, FaSave, FaSun, FaSyncAlt } from "react-icons/fa";
import "./App.css";
function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(null);
  const [backendApiUrl, setBackendApiUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [deviceConfig, setDeviceConfig] = useState("");
  const [formattedData, setFormattedData] = useState(null);
  const [forceReload, setForceReload] = useState(false);

  useEffect(() => {
    if (isDarkTheme !== null) {
      if (isDarkTheme) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
      localStorage.setItem("isDarkTheme", isDarkTheme ? "dark" : "light");
    }
  }, [isDarkTheme]);

  // Toggle dark theme
  const toggleTheme = () => {
    setIsDarkTheme((prevMode) => !prevMode);
  };
  // Load backend API URL and device configuration from local storage on initial load
  useEffect(() => {
    function init() {
      const storedApiUrl = localStorage.getItem("backendApiUrl");
      if (storedApiUrl) {
        setBackendApiUrl(storedApiUrl);
      } else {
        setShowSettings(true);
      }

      const storedDeviceConfig = localStorage.getItem("deviceConfig");
      if (storedDeviceConfig) {
        setFormattedData(formatDeviceConfiguration(storedDeviceConfig));
        setDeviceConfig(storedDeviceConfig);
      } else {
        setShowSettings(true);
      }
      const themePreference = localStorage.getItem("isDarkTheme");
      setIsDarkTheme(themePreference === "dark");
    }

    init();
  }, []);

  // Handle backend API URL change
  const handleApiUrlChange = (e) => {
    setBackendApiUrl(e.target.value);
  };

  // Save backend API URL
  const saveApiUrl = () => {
    localStorage.setItem("backendApiUrl", backendApiUrl);
  };

  // Handle device configuration change
  const handleConfigChange = (e) => {
    setDeviceConfig(e.target.value);
  };

  // Save device configuration
  const saveDeviceConfig = () => {
    try {
      const config = JSON.parse(deviceConfig);
      if (
        config.devices &&
        Array.isArray(config.devices) &&
        config.devices.every(
          (device) => device.deviceName && device.deviceType && device.roomName
        )
      ) {
        setFormattedData(formatDeviceConfiguration(JSON.stringify(config)));
        localStorage.setItem("deviceConfig", JSON.stringify(config));
        alert("Configuration saved successfully!");
      } else {
        throw new Error("Invalid configuration format");
      }
    } catch (error) {
      console.log("error", error);
      alert("Invalid configuration: " + error.message);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setDeviceConfig(event.target.result);
    };
    reader.readAsText(file);
  };

  // Export device configuration
  const exportConfig = () => {
    const blob = new Blob([deviceConfig], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "deviceConfig.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function formatDeviceConfiguration(data) {
    let jsonData = JSON.parse(data);
    let devices = jsonData.devices;
    // Step 1: Initialize an object to store formatted data
    const formattedData = {
      rooms: [],
    };
    // Step 2: Iterate over the devices array and group devices by room
    devices.forEach((device) => {
      const { roomName } = device;

      // If the roomName is not yet added to formattedData, add it
      if (!formattedData[roomName]) {
        formattedData[roomName] = [];
        formattedData.rooms.push(roomName);
      }

      // Push the device into the corresponding room array
      formattedData[roomName].push(device);
    });

    // Step 3: Return the formatted data object
    return formattedData;
  }

  const callApi = async (prompt) => {
    try {
      console.log("Prompt-", prompt);
      let result = await axios.post(backendApiUrl, { query: prompt });
      console.log("Response-", result.data.response);
      return result.data.response;
    } catch (error) {
      console.log("Error calling API:", error);
    }
  };

  function statusTextGrabber(text) {
    // Convert the input text to lowercase for case-insensitive search
    let lowerCaseText = text.toLowerCase();

    // Check if "on" is found in the text
    if (lowerCaseText.includes("on")) {
      return "ON";
    }
    // Check if "off" is found in the text
    else if (lowerCaseText.includes("off")) {
      return "OFF";
    }
    // If neither "on" nor "off" is found, return "OFFLINE"
    else {
      return "OFFLINE";
    }
  }

  function levelGrabber(text, maxLevel) {
    // Regular expression to find a number in the text
    let match = text.match(/\d+/);

    if (match) {
      let level = parseInt(match[0]); // Parse the matched number as an integer

      // Check if the extracted level is within the allowed range (1 to maxLevel)
      if (level >= 1 && level <= maxLevel) {
        return level;
      }
    }

    // Return null if no valid level was found within the specified range
    return null;
  }

  const FanComponent = ({ data, forceReload }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("OFFLINE");
    const [currentLevel, setCurrentLevel] = useState(0);
    const [debouncedSpeed, setDebouncedSpeed] = useState(0);
    const [checkLevel, setCheckLevel] = useState(0);
    const [lastFetchedAt, setLastFetchedAt] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const debounceTimeoutRef = useRef(null);
    const maxSpeed = data.maxSpeed || 5;
    useEffect(() => {
      if (localStorage.getItem(`${data.deviceName}-status`)) {
        const deviceStatus = JSON.parse(
          localStorage.getItem(`${data.deviceName}-status`)
        );

        setStatus(deviceStatus.status);
        setCurrentLevel(deviceStatus.level);
        setLastFetchedAt(deviceStatus.lastFetchedAt);
        setLoaded(true);
      }
    }, []);

    useEffect(() => {
      if ((lastFetchedAt === null || forceReload) && loaded) {
        handleRefresh();
      }
    }, [lastFetchedAt, forceReload]);

    const resetValues = () => {
      setStatus("OFF");
      setCurrentLevel(0);
    };

    const handleRefresh = async () => {
      setLoading(true);
      resetValues();
      let deviceStatus = {};
      const statusQuery = `Is my ${data.deviceName} turned on ?`;
      const statusResult = await callApi(statusQuery);
      const status = statusTextGrabber(statusResult);
      deviceStatus["status"] = status;
      const levelCheckQuery = `What is my ${data.deviceName} speed set to ?`;
      const levelCheckResult = await callApi(levelCheckQuery);
      const level = levelGrabber(levelCheckResult, maxSpeed);
      deviceStatus["level"] = level;
      deviceStatus["lastFetchedAt"] = Date.now();
      setStatus(status);
      setCurrentLevel(level);
      setDebouncedSpeed(level);
      setCheckLevel(level);
      localStorage.setItem(
        `${data.deviceName}-status`,
        JSON.stringify(deviceStatus)
      );
      setLastFetchedAt(deviceStatus["lastFetchedAt"]);
      setLoading(false);
    };

    useEffect(() => {
      if (forceReload) {
        handleRefresh();
      }
    }, [forceReload]);

    const handleStatusToggle = async () => {
      setLoading(true);
      let query;
      if (status === "ON") {
        query = `Turn off my ${data.deviceName}`;
      } else {
        query = `Turn on my ${data.deviceName}`;
      }
      await callApi(query);
      let deviceStatus = {};
      deviceStatus["status"] = status === "ON" ? "OFF" : "ON";
      deviceStatus["lastFetchedAt"] = Date.now();
      deviceStatus["level"] = currentLevel;
      setStatus(deviceStatus["status"]);
      localStorage.setItem(
        `${data.deviceName}-status`,
        JSON.stringify(deviceStatus)
      );
      setLastFetchedAt(deviceStatus["lastFetchedAt"]);
      setLoading(false);
    };

    const handleSpeedChange = (event) => {
      const speed = parseInt(event.target.value, 10);
      setCurrentLevel(speed);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedSpeed(speed);
      }, 500); // 500ms debounce delay
    };

    useEffect(() => {
      const updateSpeed = async () => {
        if (debouncedSpeed > 0 && debouncedSpeed !== checkLevel) {
          const query = `Set my ${data.deviceName} speed to ${debouncedSpeed}`;
          await callApi(query);
          let deviceStatus = {};
          deviceStatus["status"] = status;
          deviceStatus["lastFetchedAt"] = Date.now();
          deviceStatus["level"] = debouncedSpeed;
          setStatus(deviceStatus["status"]);
          localStorage.setItem(
            `${data.deviceName}-status`,
            JSON.stringify(deviceStatus)
          );
          setCheckLevel(debouncedSpeed);
          setLastFetchedAt(deviceStatus["lastFetchedAt"]);
          setLoading(false);
        }
      };

      updateSpeed();
    }, [debouncedSpeed]);

    return (
      <div className="wrapper">
        <button
          className={`refresh-button ${loading ? "spinning" : ""}`}
          onClick={handleRefresh}
        >
          <FaSyncAlt />
        </button>
        <div className="title">
          <span className={`status-indicator ${status.toLowerCase()}`} />
          {data.deviceName}
        </div>
        <div className="controls">
          <div className="item-left">
            <div
              className={`fan-animation ${
                status === "ON" ? `speed-${currentLevel}` : "halt"
              }`}
            />
          </div>
          <div className="item-right">
            <button
              className={
                "toggle-button" +
                " " +
                `${loading ? "disabled" : ""}` +
                " " +
                status.toLowerCase()
              }
              onClick={handleStatusToggle}
            >
              {status === "ON" ? "Turn Off" : "Turn On"}
            </button>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max={maxSpeed}
                value={currentLevel}
                onChange={handleSpeedChange}
                className="fan-speed-slider"
                disabled={status !== "ON" || loading}
              />
              <div className="slider-value">{currentLevel}</div>
            </div>
          </div>
        </div>
        <div className="info">
          Last Updated: {new Date(lastFetchedAt).toLocaleString()}
        </div>
      </div>
    );
  };

  const OutletComponent = ({ data, forceReload }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("OFFLINE");
    const [lastFetchedAt, setLastFetchedAt] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      if (localStorage.getItem(`${data.deviceName}-status`)) {
        const deviceStatus = JSON.parse(
          localStorage.getItem(`${data.deviceName}-status`)
        );

        setStatus(deviceStatus.status);
        setLastFetchedAt(deviceStatus.lastFetchedAt);
        setLoaded(true);
      }
    }, []);

    useEffect(() => {
      if ((lastFetchedAt === null || forceReload) && loaded) {
        handleRefresh();
      }
    }, [lastFetchedAt, forceReload]);

    const resetValues = () => {
      setStatus("OFF");
    };

    const handleRefresh = async () => {
      setLoading(true);
      resetValues();
      let deviceStatus = {};
      const statusQuery = `Is my ${data.deviceName} turned on ?`;
      const statusResult = await callApi(statusQuery);
      const status = statusTextGrabber(statusResult);
      deviceStatus["status"] = status;
      deviceStatus["lastFetchedAt"] = Date.now();
      setStatus(status);
      localStorage.setItem(
        `${data.deviceName}-status`,
        JSON.stringify(deviceStatus)
      );
      setLastFetchedAt(deviceStatus["lastFetchedAt"]);
      setLoading(false);
    };

    useEffect(() => {
      if (forceReload) {
        handleRefresh();
      }
    }, [forceReload]);

    const handleStatusToggle = async () => {
      setLoading(true);
      let query;
      if (status === "ON") {
        query = `Turn off my ${data.deviceName}`;
      } else {
        query = `Turn on my ${data.deviceName}`;
      }
      await callApi(query);
      let deviceStatus = {};
      deviceStatus["status"] = status === "ON" ? "OFF" : "ON";
      deviceStatus["lastFetchedAt"] = Date.now();
      setStatus(deviceStatus["status"]);
      localStorage.setItem(
        `${data.deviceName}-status`,
        JSON.stringify(deviceStatus)
      );
      setLastFetchedAt(deviceStatus["lastFetchedAt"]);
      setLoading(false);
    };
    return (
      <div className="wrapper">
        <button
          className={`refresh-button ${loading ? "spinning" : ""}`}
          onClick={handleRefresh}
        >
          <FaSyncAlt />
        </button>
        <div className="title">
          <span className={`status-indicator ${status.toLowerCase()}`} />
          {data.deviceName}
        </div>
        <div className="controls">
          <div className="item-left"></div>
          <div className="item-right">
            <button
              className={"toggle-button" + " " + status.toLowerCase()}
              onClick={handleStatusToggle}
            >
              {status === "ON" ? "Turn Off" : "Turn On"}
            </button>
          </div>
        </div>
        <div className="info">
          Last Updated: {new Date(lastFetchedAt).toLocaleString()}
        </div>
      </div>
    );
  };

  const LightComponent = ({ data, forceReload }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("OFFLINE");
    const [lastFetchedAt, setLastFetchedAt] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      if (localStorage.getItem(`${data.deviceName}-status`)) {
        const deviceStatus = JSON.parse(
          localStorage.getItem(`${data.deviceName}-status`)
        );

        setStatus(deviceStatus.status);
        setLastFetchedAt(deviceStatus.lastFetchedAt);
        setLoaded(true);
      }
    }, []);

    useEffect(() => {
      if ((lastFetchedAt === null || forceReload) && loaded) {
        handleRefresh();
      }
    }, [lastFetchedAt, forceReload]);

    const resetValues = () => {
      setStatus("OFF");
    };

    const handleRefresh = () => {
      setLoading(true);
      resetValues();
      let deviceStatus = {};
      const statusQuery = `Is my ${data.deviceName} turned on ?`;
      // const statusResult = await callApi(statusQuery);
      const statusResult = "Fan is on";
      const status = statusTextGrabber(statusResult);
      deviceStatus["status"] = status;
      deviceStatus["lastFetchedAt"] = Date.now();
      setStatus(status);
      localStorage.setItem(
        `${data.deviceName}-status`,
        JSON.stringify(deviceStatus)
      );
      setLastFetchedAt(deviceStatus["lastFetchedAt"]);
      setLoading(false);
    };

    useEffect(() => {
      if (forceReload) {
        handleRefresh();
      }
    }, [forceReload]);

    const handleStatusToggle = () => {
      setStatus(status === "ON" ? "OFF" : "ON");
    };
    return (
      <div className="wrapper">
        <button
          className={`refresh-button ${loading ? "spinning" : ""}`}
          onClick={handleRefresh}
        >
          <FaSyncAlt />
        </button>
        <div className="title">
          <span className={`status-indicator ${status.toLowerCase()}`} />
          {data.deviceName}
        </div>
        <div className="controls">
          <div className="item-left"></div>
          <div className="item-right">
            <button
              className={"toggle-button" + " " + status.toLowerCase()}
              onClick={handleStatusToggle}
            >
              {status === "ON" ? "Turn Off" : "Turn On"}
            </button>
          </div>
        </div>
        <div className="info">
          Last Updated: {new Date(lastFetchedAt).toLocaleString()}
        </div>
      </div>
    );
  };

  const SpeakerComponent = ({ data, forceReload }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("OFFLINE");
    const [lastFetchedAt, setLastFetchedAt] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      if (localStorage.getItem(`${data.deviceName}-status`)) {
        const deviceStatus = JSON.parse(
          localStorage.getItem(`${data.deviceName}-status`)
        );

        setStatus(deviceStatus.status);
        setLastFetchedAt(deviceStatus.lastFetchedAt);
        setLoaded(true);
      }
    }, []);

    useEffect(() => {
      if ((lastFetchedAt === null || forceReload) && loaded) {
        handleRefresh();
      }
    }, [lastFetchedAt, forceReload]);

    const resetValues = () => {
      setStatus("OFF");
    };

    const handleRefresh = () => {
      setLoading(true);
      resetValues();
      let deviceStatus = {};
      const statusQuery = `Is my ${data.deviceName} turned on ?`;
      // const statusResult = await callApi(statusQuery);
      const statusResult = "Fan is on";
      const status = statusTextGrabber(statusResult);
      deviceStatus["status"] = status;
      deviceStatus["lastFetchedAt"] = Date.now();
      setStatus(status);
      localStorage.setItem(
        `${data.deviceName}-status`,
        JSON.stringify(deviceStatus)
      );
      setLastFetchedAt(deviceStatus["lastFetchedAt"]);
      setLoading(false);
    };

    useEffect(() => {
      if (forceReload) {
        handleRefresh();
      }
    }, [forceReload]);

    const handleStatusToggle = () => {
      setStatus(status === "ON" ? "OFF" : "ON");
    };
    return (
      <div className="wrapper">
        <button
          className={`refresh-button ${loading ? "spinning" : ""}`}
          onClick={handleRefresh}
        >
          <FaSyncAlt />
        </button>
        <div className="title">
          <span className={`status-indicator ${status.toLowerCase()}`} />
          {data.deviceName}
        </div>
        <div className="controls">
          <div className="item-left"></div>
          <div className="item-right">
            <button
              className={"toggle-button" + " " + status.toLowerCase()}
              onClick={handleStatusToggle}
            >
              {status === "ON" ? "Turn Off" : "Turn On"}
            </button>
          </div>
        </div>
        <div className="info">
          Last Updated: {new Date(lastFetchedAt).toLocaleString()}
        </div>
      </div>
    );
  };
  const RoomComponent = ({ name, data, forceReload }) => {
    return (
      <div className="room-wrapper">
        <div className="room-title">{name}</div>
        <div className="room-devices">
          {data.map((device, index) => {
            switch (device.deviceType) {
              case "Fan": {
                return (
                  <div className="single-device" key={index}>
                    <FanComponent data={device} forceReload={forceReload} />
                  </div>
                );
              }
              case "Outlet": {
                return (
                  <div className="single-device" key={index}>
                    <OutletComponent data={device} forceReload={forceReload} />
                  </div>
                );
              }
              case "Light": {
                return (
                  <div className="single-device" key={index}>
                    <LightComponent data={device} forceReload={forceReload} />
                  </div>
                );
              }
              case "Speaker": {
                return (
                  <div className="single-device" key={index}>
                    <SpeakerComponent data={device} forceReload={forceReload} />
                  </div>
                );
              }
              default: {
                return <></>;
              }
            }
          })}
        </div>
      </div>
    );
  };
  return (
    <div className="app">
      <header className="header">
        <h1>J-Googlehome</h1>
        <div className="header-icons">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkTheme ? <FaSun /> : <FaMoon />}
          </button>
          <button
            className="settings-toggle"
            onClick={() => setShowSettings(true)}
          >
            <FaCog />
          </button>
        </div>
      </header>
      <main>
        {showSettings ? (
          <div className="settings-panel">
            <h2>Configuration </h2>
            <div className="settings-section">
              <label>Backend API URL:</label>
              <div className="settings-sub-section">
                <input
                  type="text"
                  value={backendApiUrl}
                  onChange={handleApiUrlChange}
                  placeholder="Enter backend API URL"
                />
                <FaSave
                  onClick={saveApiUrl}
                  style={{
                    marginLeft: 10,
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>
            <div className="settings-section">
              <label>Device Configuration:</label>
              <textarea
                value={deviceConfig}
                onChange={handleConfigChange}
                placeholder="Enter or paste configuration JSON"
              />
              <input type="file" accept=".json" onChange={handleFileUpload} />
              <button className="small-button" onClick={saveDeviceConfig}>
                <FaSave /> Save Configuration
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <button className="export-button" onClick={exportConfig}>
                Export Configuration
              </button>
              <button
                className="close-button"
                onClick={() => setShowSettings(false)}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="home">
            {formattedData &&
              formattedData.rooms.map((room, index) => (
                <RoomComponent
                  key={index}
                  name={room}
                  data={formattedData[room]}
                  forceReload={forceReload}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
