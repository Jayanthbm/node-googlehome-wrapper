import { Flex } from "antd";
import React, { useEffect, useState } from "react";
import { DEVICE_STATUS } from "../constants";
import {
  getDeviceStatus,
  getDeviceStatusFromStorage,
  isTimeDifferenceExceeded,
  toggleDeviceStatus,
} from "../utils";
import DeviceCard from "./DeviceCard";
import { OutletSVG } from "./SvgComponets";

const OutletComponent = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(DEVICE_STATUS.OFFLINE);
  const [loaded, setLoaded] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const TIME_DIFFERENCE = 10; //in minutes

  // Fetch device status and initial data
  useEffect(() => {
    const deviceStatus = getDeviceStatusFromStorage(data.deviceName);
    const initialStatus = deviceStatus?.status || DEVICE_STATUS.OFFLINE;
    setLastFetchedAt(deviceStatus?.lastFetchedAt || null);
    setLoaded(true);
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

  const resetValues = () => {
    setStatus(DEVICE_STATUS.OFFLINE);
  };

  const handleRefresh = async () => {
    setLoading(true);
    resetValues();
    try {
      const deviceStatus = await getDeviceStatus(data.deviceName);
      setStatus(deviceStatus["status"]);
      setLastFetchedAt(deviceStatus["lastFetchedAt"]);
      return deviceStatus["lastApiRequestStatus"];
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

  return (
    <DeviceCard
      title={data.deviceName}
      isLoading={!loaded}
      onReload={handleRefresh}
    >
      <Flex gap="small" vertical align="center">
        <div
          onClick={toggleStatus}
          style={{
            cursor:
              status !== DEVICE_STATUS.OFFLINE ? "pointer" : "not-allowed",
            opacity: loading ? 0.5 : 1,
          }}
        >
          <OutletSVG status={status} />
        </div>
      </Flex>
    </DeviceCard>
  );
};

export default OutletComponent;
