import { Card } from "antd";
import React, { useEffect, useState } from "react";
import { getDeviceStatus, getDeviceStatusFromStorage } from "../utils";
import DeviceCard from "./DeviceCard";
const OutletComponent = ({ data, forceReload }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("OFFLINE");
  const [loaded, setLoaded] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const resetValues = () => {
    setStatus("OFFLINE");
  };

  useEffect(() => {
    const deviceStatus = getDeviceStatusFromStorage(data.deviceName);
    setStatus(deviceStatus?.status ? deviceStatus.status : "OFFLINE");
    setLastFetchedAt(
      deviceStatus?.lastFetchedAt ? deviceStatus.lastFetchedAt : null
    );
    setLoaded(true);
  }, []);

  useEffect(() => {
    if ((lastFetchedAt === null || forceReload) && loaded) {
      handleRefresh();
    }
  }, [lastFetchedAt, forceReload]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      resetValues();
      let deviceStatus = await getDeviceStatus(data.deviceName);
      setStatus(deviceStatus["status"]);
      setLastFetchedAt(deviceStatus["lastFetchedAt"]);
      setLoading(false);
      return true;
    } catch (error) {
      console.log("Error");
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    if (forceReload) {
      handleRefresh();
    }
  }, [forceReload]);

  return (
    <DeviceCard
      title={data.deviceName}
      isLoading={loading}
      status={status}
      onReload={handleRefresh}
      fetchedAt={lastFetchedAt}
    >
      <Card.Grid
        style={{
          width: "30%",
          textAlign: "center",
        }}
        hoverable={false}
      >
        Content
      </Card.Grid>
      <Card.Grid
        hoverable={false}
        style={{
          width: "70%",
          textAlign: "center",
        }}
      >
        Content
      </Card.Grid>
    </DeviceCard>
  );
};

export default OutletComponent;
