import { Button, Flex, Popover, Slider } from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  getDeviceLevel,
  getDeviceStatus,
  getDeviceStatusFromStorage,
  isTimeDifferenceExceeded,
  saveDeviceStatusToStorage,
  toggleDeviceStatus,
  updateLevel,
} from "../utils";
import DeviceCard from "./DeviceCard";

import { DEVICE_STATUS, LIGHT_COLORS } from "../constants";
import CustomColorPicker from "./CustomColorPicker";
import { LightSvg } from "./SvgComponets";

const LightComponent = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(DEVICE_STATUS.OFFLINE);
  const [loaded, setLoaded] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [debouncedLevel, setDebouncedLevel] = useState(0);
  const [checkLevel, setCheckLevel] = useState(0);

  const [selectedColor, setSelectedColor] = useState(
    LIGHT_COLORS["cool white"]
  );
  const [popoverVisible, setPopoverVisible] = useState(false);

  const debounceTimeoutRef = useRef(null);
  const maxLevel = 100;
  const TIME_DIFFERENCE = 10; //in minutes

  // Fetch device status and initial data
  useEffect(() => {
    const deviceStatus = getDeviceStatusFromStorage(data.deviceName);
    const initialStatus = deviceStatus?.status || DEVICE_STATUS.OFFLINE;
    const initialLevel = deviceStatus?.level || 1;
    const intialColor = deviceStatus?.color || LIGHT_COLORS["cool white"];

    setStatus(initialStatus);
    setCurrentLevel(initialLevel);
    setDebouncedLevel(initialLevel);
    setCheckLevel(initialLevel);
    setSelectedColor(intialColor);
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
            queryVariable: "brightness",
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
      if (deviceStatus["status"] == DEVICE_STATUS.ON) {
        deviceLevel = await getDeviceLevel({
          deviceName: data.deviceName,
          queryVariable: "brightness",
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
    }, 1000); // 1000ms debounce delay
  };

  const handleColorChange = async (color, value) => {
    setLoading(true);
    try {
      const updatedColor = await updateLevel({
        deviceName: data.deviceName,
        property: color,
        propertyVariable: "color",
        queryVariable: "color",
        defaultPropertyValue: LIGHT_COLORS["cool white"],
      });

      if (updatedColor["color"] === color) {
        setSelectedColor(value);
        updatedColor["color"] = value;
        saveDeviceStatusToStorage(data.deviceName, updatedColor);
      } else {
        setSelectedColor(updatedColor["color"]);
      }
      setLastFetchedAt(updatedColor["lastFetchedAt"]);
      setStatus(updatedColor["status"]);
      setPopoverVisible(false);
    } catch (error) {
      console.error("Error updating color:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeviceCard
      title={data.deviceName}
      isLoading={!loaded}
      onReload={handleRefresh}
    >
      <Flex gap="small" vertical align="center">
        <Flex gap="small" align="center">
          <div
            onClick={toggleStatus}
            style={{
              cursor:
                status !== DEVICE_STATUS.OFFLINE ? "pointer" : "not-allowed",
              opacity: loading ? 0.5 : 1,
            }}
          >
            <LightSvg status={status} color={selectedColor} />
          </div>

          <Popover
            content={
              <div style={{ width: 200, height: 150, overflowY: "auto" }}>
                <CustomColorPicker
                  colors={LIGHT_COLORS}
                  selectedColor={selectedColor}
                  onChange={handleColorChange}
                />
              </div>
            }
            title="Change Color"
            trigger="click"
            open={popoverVisible}
            onOpenChange={setPopoverVisible}
          >
            <Button
              shape="square"
              style={{
                width: 30,
                height: 30,
                backgroundColor:
                  status === DEVICE_STATUS.ON
                    ? selectedColor
                    : status === DEVICE_STATUS.OFF
                    ? "#fff"
                    : "#ccc",
                border: `1px solid ${
                  status === DEVICE_STATUS.ON
                    ? "#ccc"
                    : status === DEVICE_STATUS.OFF
                    ? "red"
                    : "#ccc"
                }`,
                marginTop: 10,
              }}
              disabled={status !== DEVICE_STATUS.ON || loading}
            />
          </Popover>
        </Flex>

        <Slider
          dots={true}
          style={{
            width: "150px",
          }}
          tooltip={{
            open: status === "ON" && !popoverVisible ? true : false,
            autoAdjustOverflow: true,
            placement: "top",
          }}
          min={1}
          max={parseInt(maxLevel, 10)}
          keyboard={true}
          step={1}
          value={status === "ON" ? currentLevel : null}
          disabled={status !== "ON" || loading}
          onChange={handleLevelChange}
          marks={{
            10: "10",
            25: "25",
            50: "50",
            75: "75",
            95: "95",
          }}
        />
      </Flex>
    </DeviceCard>
  );
};

export default LightComponent;
