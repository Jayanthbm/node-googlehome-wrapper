import { message } from "antd";
import axios from "axios";
export const formatDeviceConfiguration = (data) => {
  let jsonData;
  if (typeof data === 'string') {
    jsonData = JSON.parse(data);
  } else {
    jsonData = data;
  }

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
};

export const statusTextGrabber = (text) => {
  if (!text) {
    return "OFFLINE";
  }
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
};

export const levelGrabber = (text, maxLevel) => {
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
};

export const assistantAPI = async (prompt) => {
  const backendApiUrl = localStorage.getItem("backendApiUrl");
  try {
    let result = await axios.post(backendApiUrl, { query: prompt });
    return result.data.response;
  } catch (error) {
    console.log("Error calling API:", error);
    if(error?.response?.status == 401){
      const authURL = backendApiUrl.replace("/query", "/auth/start");
      window.open(authURL, "_blank");
      message.destroy("API_ERROR");
      message.info("Please login to continue");
      return null;
    } else {
      message.destroy("API_ERROR");
      message.error({
        content: error.message,
        key: "API_ERROR",
      });
      return null;
    }

  }
};


// Export device configuration
export const exportConfig = (deviceConfig) => {
  const blob = new Blob([deviceConfig], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "deviceConfig.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export const isValidConfig = (config) => {
  try {
    let deviceConfig = JSON.parse(config);
    if (
        deviceConfig.devices &&
        Array.isArray(deviceConfig.devices) &&
        deviceConfig.devices.every(
          (device) => device.deviceName && device.deviceType && device.roomName
        )
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.log("Invalid configuration: " + error.message);
    return false;
  }
}

export const getDeviceStatusFromStorage = (deviceName) => {
  try {
    const deviceStatus = localStorage.getItem(`${deviceName}-status`);
    if (deviceStatus) {
      return JSON.parse(deviceStatus);
    } else {
      return {}
    }
  } catch (error) {
    console.log("Error getting device status from storage:", error);
    return {};
  }
}

export const saveDeviceStatusToStorage = (deviceName, deviceStatus) => {
  try {
    localStorage.setItem(`${deviceName}-status`, JSON.stringify(deviceStatus));
  } catch (error) {
    console.log("Error saving device status to storage:", error);
  }
}

export const getDeviceStatus = async (deviceName) => {
  try {
    const deviceStatus = getDeviceStatusFromStorage(deviceName);
    const statusQuery = `Is my ${deviceName} turned on ?`;
    let status = "OFFLINE";
    const statusResult = await assistantAPI(statusQuery);
    status = statusTextGrabber(statusResult);
    deviceStatus["lastApiRequestStatus"] = statusResult == null ? false: true;
    deviceStatus["status"] = status;
    deviceStatus["lastFetchedAt"] = Date.now();
    saveDeviceStatusToStorage(deviceName, deviceStatus);
    return deviceStatus;
  } catch (error) {
    console.log("Error getting device status:", error);
    return {};
  }
};


export const toggleDeviceStatus = async (deviceName, currentStatus) => {
  try {
    let query;
    if (currentStatus === "ON") {
      query = `Turn off my ${deviceName}`;
    } else {
      query = `Turn on my ${deviceName}`;
    }
    let deviceStatus = getDeviceStatusFromStorage(deviceName);
    try {
      const result = await assistantAPI(query);
      if (result !== null) {
        message.success(result);
        deviceStatus["status"] = currentStatus === "ON" ? "OFF" : "ON";
        deviceStatus["lastFetchedAt"] = Date.now();
        saveDeviceStatusToStorage(deviceName, deviceStatus);

        return deviceStatus;
      } else {
        message.error(`Failed to ${query}. Please try again.`);
        return deviceStatus
      }

    } catch (error) {
      console.log("Error calling API:", error);
      return deviceStatus;
    }

  } catch (error) {
    console.log("Error toggling device status:", error);
  }
}