
import { Card, Divider, Flex, Slider, Typography, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { assistantAPI, getDeviceStatus, getDeviceStatusFromStorage, levelGrabber, saveDeviceStatusToStorage, toggleDeviceStatus } from "../utils";
import DeviceCard from "./DeviceCard";
import ToggleButton from "./ToggleButton";

const { Text } = Typography;
const FanComponent = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("OFFLINE");
  const [loaded, setLoaded] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);


  const [currentLevel, setCurrentLevel] = useState(1);
  const [debouncedSpeed, setDebouncedSpeed] = useState(0);
  const [checkLevel, setCheckLevel] = useState(0);

  const debounceTimeoutRef = useRef(null);
  const maxSpeed = data.maxSpeed || 5;
  useEffect(() => {
    const deviceStatus = getDeviceStatusFromStorage(data.deviceName);
    setStatus(deviceStatus?.status ? deviceStatus.status : 'OFFLINE');
    setCurrentLevel(deviceStatus?.level ? deviceStatus.level : 1);
    setDebouncedSpeed(deviceStatus?.level ? deviceStatus.level : 1);
    setCheckLevel(deviceStatus?.level ? deviceStatus.level : 1);
    setLastFetchedAt(deviceStatus
      ?.lastFetchedAt ? deviceStatus.lastFetchedAt : null);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if ((lastFetchedAt === null ) && loaded) {
      handleRefresh();
    }
  }, [lastFetchedAt,]);


   const resetValues = () => {
     setStatus("OFFLINE");
   };
  const handleRefresh = async () => {
    try {
      setLoading(true);
      resetValues();
      let deviceStatus = await getDeviceStatus(data.deviceName);
      let queryLevelPrompt = `What is my ${data.deviceName} set to?`;
      let queryLevel = await assistantAPI(queryLevelPrompt);
      const level = levelGrabber(queryLevel, maxSpeed);
      deviceStatus["level"] = level;
      deviceStatus["lastFetchedAt"] = Date.now();
      setStatus(deviceStatus["status"] ? deviceStatus["status"] : 'OFFLINE');
      setCurrentLevel(deviceStatus["level"] ? deviceStatus["level"] : 1);
      setDebouncedSpeed(deviceStatus["level"] ? deviceStatus["level"] : 1);
      setCheckLevel(deviceStatus["level"] ? deviceStatus["level"] : 1);
      setLastFetchedAt(deviceStatus["lastFetchedAt"] ? deviceStatus["lastFetchedAt"] : null);
      saveDeviceStatusToStorage(data.deviceName, deviceStatus);
      setLoading(false);
      return deviceStatus["lastApiRequestStatus"];
    } catch (error) {
      console.log("Error");
      setLoading(false);
      return false;
    }
  };


  const toggleStatus = async () => {
    setLoading(true);
    let updatedStatus = await toggleDeviceStatus(data.deviceName, status);
    setStatus(updatedStatus["status"] ? updatedStatus["status"] : "OFFLINE");
    setLastFetchedAt(
      updatedStatus["lastFetchedAt"] ? updatedStatus["lastFetchedAt"] : null
    );
    setLoading(false);
  };

  const handleSpeedChange = (value) => {
    const speed = value;
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
        setLoading(true);
        let deviceStatus = getDeviceStatusFromStorage(data.deviceName);
        try {
          const query = `Set my ${data.deviceName} speed to ${debouncedSpeed}`;
          const result = await assistantAPI(query);
          message.success(result);
          deviceStatus["level"] = debouncedSpeed;
          setCheckLevel(debouncedSpeed);
        } catch (error) {
          deviceStatus["status"] = "OFFLINE";
          deviceStatus["level"] = 1;
          setCheckLevel(1);
          message.error(error);
        }

        deviceStatus["lastFetchedAt"] = Date.now();
        saveDeviceStatusToStorage(data.deviceName, deviceStatus);
        setLastFetchedAt(deviceStatus["lastFetchedAt"]);
        setLoading(false);
      }
    };

    updateSpeed();
  }, [debouncedSpeed]);

  return (
    <DeviceCard
      title={data.deviceName}
      isLoading={!loaded}
      status={status}
      onReload={handleRefresh}
      fetchedAt={lastFetchedAt}
    >
      <Card.Grid
        style={{
          width: "30%",
        }}
        hoverable={false}
      >
        <div
          className={
            status === "OFFLINE"
              ? "fan-offline"
              : status !== "ON"
              ? "fan-blades stopped"
              : `fan-blades speed-${currentLevel}`
          }
        ></div>
      </Card.Grid>
      <Card.Grid
        hoverable={false}
        style={{
          width: "70%",
        }}
      >
        <Flex vertical gap="small">
          <Flex wrap gap="small">
            <ToggleButton
              onToggle={toggleStatus}
              isLoading={loading}
              status={status}
            />
            <Divider type="vertical" style={{ height: "100px" }} />
            <Flex gap="small" vertical>
              <Text type="secondary">Speed</Text>
              <Slider
                dots={true}
                style={{
                  width: "150px",
                }}
                tooltip={{
                  open: status === "ON" ? true : false,
                  placement: "bottom",
                }}
                min={1}
                max={parseInt(maxSpeed, 10)}
                keyboard={true}
                step={1}
                value={status === "ON" ? currentLevel : null}
                disabled={status !== "ON" || loading}
                marks={{
                  1: "1",
                  2: "2",
                  3: "3",
                  4: "4",
                  5: "5",
                }}
                onChange={handleSpeedChange}
              />
            </Flex>
          </Flex>
        </Flex>
      </Card.Grid>
    </DeviceCard>
  );
};

export default FanComponent;
