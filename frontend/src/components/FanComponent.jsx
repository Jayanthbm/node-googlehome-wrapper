import { Flex, Slider } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { DEVICE_STATUS } from "../constants";
import {
  getDeviceLevel,
  getDeviceStatus,
  getDeviceStatusFromStorage,
  isTimeDifferenceExceeded,
  toggleDeviceStatus,
  updateLevel,
} from "../utils";
import DeviceCard from "./DeviceCard";

const FanComponent = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(DEVICE_STATUS.OFFLINE);
  const [loaded, setLoaded] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [debouncedLevel, setDebouncedLevel] = useState(0);
  const [checkLevel, setCheckLevel] = useState(0);

  const debounceTimeoutRef = useRef(null);
  const maxLevel = data.maxSpeed || 5;
  const TIME_DIFFERENCE = 10; //in minutes

  // Fetch device status and initial data
  useEffect(() => {
    const deviceStatus = getDeviceStatusFromStorage(data.deviceName);
    const initialStatus = deviceStatus?.status || DEVICE_STATUS.OFFLINE;
    const initialLevel = deviceStatus?.level || 1;

    setStatus(initialStatus);
    setCurrentLevel(initialLevel);
    setDebouncedLevel(initialLevel);
    setCheckLevel(initialLevel);
    setLastFetchedAt(deviceStatus?.lastFetchedAt || null);
    setLoaded(true);
  }, [data.deviceName]);

  // Refresh data if last fetched time is outdated
  useEffect(() => {
    if (
      (!lastFetchedAt ||
        isTimeDifferenceExceeded(lastFetchedAt, TIME_DIFFERENCE)) &&
      loaded
    ) {
      handleRefresh();
    }
  }, [lastFetchedAt, loaded]);

  // Debounce level changes
  useEffect(() => {
    if (debouncedLevel > 0 && debouncedLevel !== checkLevel) {
      const handleLevel = async () => {
        setLoading(true);
        try {
          const updatedLevel = await updateLevel({
            deviceName: data.deviceName,
            property: debouncedLevel,
            propertyVariable: "level",
            queryVariable: "speed",
            defaultPropertyValue: 1,
          });
          setCurrentLevel(updatedLevel.level);
          setDebouncedLevel(updatedLevel.level);
          setCheckLevel(updatedLevel.level);
          setStatus(updatedLevel.status);
          setLastFetchedAt(updatedLevel.lastFetchedAt);
        } catch (error) {
          console.error("Error updating speed:", error);
        } finally {
          setLoading(false);
        }
      };

      handleLevel();
    }
  }, [debouncedLevel, checkLevel, data.deviceName]);

  const resetValues = () => {
    setStatus(DEVICE_STATUS.OFFLINE);
  };

  const handleRefresh = async () => {
    setLoading(true);
    resetValues();
    try {
      let deviceStatus = await getDeviceStatus(data.deviceName);
      let deviceLevel;
      if (deviceStatus["status"] === DEVICE_STATUS.ON) {
        deviceLevel = await getDeviceLevel({
          deviceName: data.deviceName,
          queryVariable: "speed",
          maxLevel,
        });
        setCurrentLevel(deviceLevel["level"]);
        setCheckLevel(deviceLevel["level"]);
        setDebouncedLevel(deviceLevel["level"]);
      } else {
        deviceLevel = deviceStatus;
      }
      setStatus(deviceLevel["status"]);
      setLastFetchedAt(deviceLevel["lastFetchedAt"]);
      return deviceLevel["lastApiRequestStatus"];
    } catch (error) {
      console.error("Error refreshing device status:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (status === DEVICE_STATUS.OFFLINE) {
      return;
    }
    setLoading(true);
    try {
      const updatedStatus = await toggleDeviceStatus(data.deviceName, status);
      setStatus(updatedStatus.status || DEVICE_STATUS.OFFLINE);
      setLastFetchedAt(updatedStatus.lastFetchedAt || null);
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (value) => {
    setCurrentLevel(value);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedLevel(value);
    }, 500); // 500ms debounce delay
  };

  return (
    <DeviceCard
      title={data.deviceName}
      isLoading={!loaded}
      onReload={handleRefresh}
    >
      <Flex gap="small" vertical align="center">
        <div
          onClick={toggleStatus}
          className={
            status === DEVICE_STATUS.OFFLINE
              ? "svg-wrapper fan-offline"
              : status !== DEVICE_STATUS.ON
              ? "svg-wrapper fan-blades stopped"
              : `svg-wrapper fan-blades speed-${currentLevel}`
          }
        />
        <Slider
          dots={true}
          style={{
            width: "150px",
          }}
          min={1}
          max={parseInt(maxLevel, 10)}
          keyboard={true}
          step={1}
          value={status === DEVICE_STATUS.ON ? currentLevel : null}
          disabled={status !== DEVICE_STATUS.ON || loading}
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
    </DeviceCard>
  );
};

export default FanComponent;
