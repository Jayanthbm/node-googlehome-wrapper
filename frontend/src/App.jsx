
import { message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import AppHeader from "./components/AppHeader";
import RoomComponent from "./components/RoomComponent";
import SettingsComponent from "./components/SettingsComponent";
import { formatDeviceConfiguration, isValidConfig } from "./utils";
const App = () => {
  const [backendApiUrl, setBackendApiUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [deviceConfig, setDeviceConfig] = useState("");
  const [formattedData, setFormattedData] = useState(null);
  const [forceReload, setForceReload] = useState(false);

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
    }

    init();
  }, []);

  const handleApiUrlChange = (e) => {
    setBackendApiUrl(e.target.value);
  };

  // Save backend API URL
  const saveApiUrl = () => {
    localStorage.setItem("backendApiUrl", backendApiUrl);
    message.success("Backend API URL saved successfully");
  };

  // Handle device configuration change
  const handleConfigChange = (e) => {
    setDeviceConfig(e.target.value);
  };

  // Save device configuration
  const saveDeviceConfig = () => {
    if (isValidConfig(deviceConfig)) {
      setFormattedData(formatDeviceConfiguration(deviceConfig));
      if(typeof deviceConfig === "string") {
        localStorage.setItem("deviceConfig", deviceConfig);
      } else {
        localStorage.setItem("deviceConfig", JSON.stringify(deviceConfig));
      }
      message.success("Configuration saved successfully");
    } else {
      message.error("Invalid configuration format");
    }
  };

  return (
    <div className="App">
      <AppHeader onCogToggle={() => setShowSettings(true)} />

      <div className="container">
        {showSettings ? (
          <SettingsComponent
            backendApiUrl={backendApiUrl}
            handleApiUrlChange={handleApiUrlChange}
            saveApiUrl={saveApiUrl}
            deviceConfig={deviceConfig}
            handleConfigChange={handleConfigChange}
            setDeviceConfig={(config) => setDeviceConfig(config)}
            saveDeviceConfig={saveDeviceConfig}
            closeSettings={() => setShowSettings(false)}
          />
        ) : (
          <>
            {formattedData &&
              formattedData?.rooms.map((room, index) => (
                <RoomComponent
                  key={index}
                  name={room}
                  data={formattedData[room]}
                  forceReload={forceReload}
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
