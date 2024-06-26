import { Card, Divider, Flex, Popover, Slider, Typography } from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  getDeviceLevel,
  getDeviceStatus,
  getDeviceStatusFromStorage,
  saveDeviceStatusToStorage,
  toggleDeviceStatus,
  updateLevel,
} from "../utils";
import CustomColorPicker from "./CustomColorPicker";
import DeviceCard from "./DeviceCard";
import { LightSvg } from "./SvgComponets";
import ToggleButton from "./ToggleButton";

const { Text } = Typography;

const LightComponent = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("OFFLINE");
  const [loaded, setLoaded] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [debouncedLevel, setDebouncedLevel] = useState(0);
  const [checkLevel, setCheckLevel] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [popoverVisible, setPopoverVisible] = useState(false);

  const debounceTimeoutRef = useRef(null);
  const maxLevel = 100;

  useEffect(() => {
    const deviceStatus = getDeviceStatusFromStorage(data.deviceName);
    setStatus(deviceStatus?.status ? deviceStatus.status : "OFFLINE");
    setCurrentLevel(deviceStatus?.level ? deviceStatus.level : 1);
    setDebouncedLevel(deviceStatus?.level ? deviceStatus.level : 1);
    setCheckLevel(deviceStatus?.level ? deviceStatus.level : 1);
    setLastFetchedAt(
      deviceStatus?.lastFetchedAt ? deviceStatus.lastFetchedAt : null
    );
    setSelectedColor(deviceStatus?.color ? deviceStatus.color : "#FFFFFF");
    setLoaded(true);
  }, [data.deviceName]);

  useEffect(() => {
    if (lastFetchedAt === null && loaded) {
      handleRefresh();
    }
  }, [lastFetchedAt, loaded]);

  const resetValues = () => {
    setStatus("OFFLINE");
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      resetValues();
      let deviceStatus = await getDeviceStatus(data.deviceName);
      let deviceLevel;
      if(deviceStatus["status"] == "ON"){
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
      setLoading(false);
      return deviceLevel["lastApiRequestStatus"];
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

  const handleLevelChange = (value) => {
    const speed = value;
    setCurrentLevel(speed);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedLevel(speed);
    }, 1000); // 1000ms debounce delay
  };

  useEffect(() => {
    const updateSpeed = async () => {
      if (debouncedLevel > 0 && debouncedLevel !== checkLevel) {
        setLoading(true);
        const updatedLevel = await updateLevel({
          deviceName: data.deviceName,
          property: debouncedLevel,
          propertyVariable: "level",
          queryVariable: "brightness",
          defaultPropertyValue:1,
        });
        setCurrentLevel(updatedLevel["level"]);
        setDebouncedLevel(updatedLevel["level"]);
        setCheckLevel(updatedLevel["level"]);
        setStatus(updatedLevel["status"]);
        setLastFetchedAt(updatedLevel["lastFetchedAt"]);
        setLoading(false);
      }
    };

    updateSpeed();
  }, [debouncedLevel, checkLevel, data.deviceName]);

  const handleColorChange = async (color, value) => {
    setLoading(true);
    const updatedColor = await updateLevel({
      deviceName: data.deviceName,
      property: color,
      propertyVariable: "color",
      queryVariable: "color",
      defaultPropertyValue: "#FFFFFF",
    });

    if (updatedColor['color'] === color) {
      setSelectedColor(value);
      updatedColor['color'] = value;
      saveDeviceStatusToStorage(data.deviceName,updatedColor);
    } else {
      setSelectedColor(updatedColor['color']);
    }
    setLastFetchedAt(updatedColor["lastFetchedAt"]);
    setStatus(updatedColor["status"]);
    setPopoverVisible(false);
    setLoading(false);
  };

  const handlePopoverVisibleChange = (visible) => {
    setPopoverVisible(visible);
  };

  const colorPickerContent = (
    <div style={{ maxWidth: "200px", maxHeight: "150px", overflowY: "auto" }}>
      <CustomColorPicker
        colors={data.colors}
        selectedColor={selectedColor}
        onChange={handleColorChange}
      />
    </div>
  );

  const lightSvgElement = (
    <Card.Grid
      style={{
        width: "30%",
      }}
      hoverable={false}
    >
      <LightSvg status={status} color={selectedColor} />
    </Card.Grid>
  );

  return (
    <DeviceCard
      title={data.deviceName}
      isLoading={!loaded}
      status={status}
      onReload={handleRefresh}
      fetchedAt={lastFetchedAt}
    >
      {(data.colors && status === "ON") ? (
        <Popover
          content={colorPickerContent}
          trigger="click"
          open={popoverVisible}
          onOpenChange={handlePopoverVisibleChange}
          title="Change Color"
        >
          {lightSvgElement}
        </Popover>
      ) : (
        lightSvgElement
      )}
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
              <Text type="secondary">Brightness {status ==='ON' ? `(${currentLevel}%)` : ''}</Text>
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
                onChange={handleLevelChange}
              />
            </Flex>
          </Flex>
        </Flex>
      </Card.Grid>
    </DeviceCard>
  );
};

export default LightComponent;
