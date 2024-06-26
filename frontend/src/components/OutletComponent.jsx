import { Card, Flex } from "antd";
import React, { useEffect, useState } from "react";
import {
  getDeviceStatus,
  getDeviceStatusFromStorage,
  toggleDeviceStatus,
} from "../utils";
import DeviceCard from "./DeviceCard";
import ToggleButton from "./ToggleButton";
import { OutletSVG } from "./SvgComponets";

const OutletComponent = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("OFFLINE");
  const [loaded, setLoaded] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  useEffect(() => {
    const deviceStatus = getDeviceStatusFromStorage(data.deviceName);
    setStatus(deviceStatus?.status ? deviceStatus.status : "OFFLINE");
    setLastFetchedAt(
      deviceStatus?.lastFetchedAt ? deviceStatus.lastFetchedAt : null
    );
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (lastFetchedAt === null && loaded) {
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
      let deviceStatus = await getDeviceStatus(data.deviceName);
      setStatus(deviceStatus["status"] ? deviceStatus["status"] : "OFFLINE");
      setLastFetchedAt(
        deviceStatus["lastFetchedAt"] ? deviceStatus["lastFetchedAt"] : null
      );
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
        <OutletSVG status={status} />
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
          </Flex>
        </Flex>
      </Card.Grid>
    </DeviceCard>
  );
};

export default OutletComponent;
