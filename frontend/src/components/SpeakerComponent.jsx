import { Card, Flex } from "antd";
import React, { useEffect, useState } from "react";
import {
  getDeviceStatus,
  getDeviceStatusFromStorage,
  toggleDeviceStatus,
} from "../utils";
import DeviceCard from "./DeviceCard";
import { SpeakerSVG } from "./SvgComponets";

const SpeakerComponent = ({ data }) => {
  const [loading, setLoading] = useState(false);
  return (
    <DeviceCard title={data.deviceName} onReload={null} status={"ON"} loading={loading}>
      <Card.Grid
        style={{
          width: "30%",
        }}
        hoverable={false}
      >
        <SpeakerSVG />
      </Card.Grid>
      <Card.Grid
        hoverable={false}
        style={{
          width: "70%",
        }}
      >
        <Flex vertical gap="small">
          <Flex wrap gap="small"></Flex>
        </Flex>
      </Card.Grid>
    </DeviceCard>
  );
};

export default SpeakerComponent;
