
import { Card, Divider, Flex, Slider, Typography, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { assistantAPI, getDeviceLevel, getDeviceStatus, getDeviceStatusFromStorage, levelGrabber, saveDeviceStatusToStorage, toggleDeviceStatus, updateLevel } from "../utils";
import DeviceCard from "./DeviceCard";
import ToggleButton from "./ToggleButton";

const { Text } = Typography;
const FanComponent = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("OFFLINE");
  const [loaded, setLoaded] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);


  const [currentLevel, setCurrentLevel] = useState(1);
  const [debouncedLevel, setdebouncedLevel] = useState(0);
  const [checkLevel, setCheckLevel] = useState(0);

  const debounceTimeoutRef = useRef(null);
  const maxLevel = data.maxSpeed || 5;
  useEffect(() => {
    const deviceStatus = getDeviceStatusFromStorage(data.deviceName);
    setStatus(deviceStatus?.status ? deviceStatus.status : 'OFFLINE');
    setCurrentLevel(deviceStatus?.level ? deviceStatus.level : 1);
    setdebouncedLevel(deviceStatus?.level ? deviceStatus.level : 1);
    setCheckLevel(deviceStatus?.level ? deviceStatus.level : 1);
    setLastFetchedAt(deviceStatus
      ?.lastFetchedAt ? deviceStatus.lastFetchedAt : null);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if ((lastFetchedAt === null ) && loaded) {
      handleRefresh();
    }
  }, [lastFetchedAt]);


   const resetValues = () => {
     setStatus("OFFLINE");
   };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      resetValues();
      await getDeviceStatus(data.deviceName);
      let deviceLevel = await getDeviceLevel({
        deviceName: data.deviceName,
        queryVariable: 'speed',
        maxLevel
      });
      setStatus(deviceLevel['status']);
      setCurrentLevel(deviceLevel['level']);
      setCheckLevel(deviceLevel['level']);
      setdebouncedLevel(deviceLevel['level']);
      setLastFetchedAt(deviceLevel['lastFetchedAt']);
      setLoading(false);
      return deviceLevel["lastApiRequestStatus"];
    } catch (error) {
      console.log("Error",error);
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

  const handleLevelChange = (value) => {
    const speed = value;
    setCurrentLevel(speed);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setdebouncedLevel(speed);
    }, 500); // 500ms debounce delay
  };

  useEffect(() => {
    const updateSpeed = async () => {
      if (debouncedLevel > 0 && debouncedLevel !== checkLevel) {
        setLoading(true);
        const updatedLevel = await updateLevel({
          deviceName: data.deviceName,
          property: debouncedLevel,
          propertyVariable: "level",
          queryVariable: "speed",
          defaultPropertyValue: 1,
        });
        setCurrentLevel(updatedLevel["level"]);
        setdebouncedLevel(updatedLevel["level"]);
        setCheckLevel(updatedLevel["level"]);
        setStatus(updatedLevel["status"]);
        setLastFetchedAt(updatedLevel["lastFetchedAt"]);
        setLoading(false);
      }
    };

    updateSpeed();
  }, [debouncedLevel]);

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
              ? "svg-wrapper fan-offline"
              : status !== "ON"
              ? "svg-wrapper fan-blades stopped"
              : `svg-wrapper fan-blades speed-${currentLevel}`
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
                min={1}
                max={parseInt(maxLevel, 10)}
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
                onChange={handleLevelChange}
              />
            </Flex>
          </Flex>
        </Flex>
      </Card.Grid>
    </DeviceCard>
  );
};

export default FanComponent;
