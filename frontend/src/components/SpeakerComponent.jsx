import { Flex } from "antd";
import React, { useState } from "react";
import DeviceCard from "./DeviceCard";
import { SpeakerSVG } from "./SvgComponets";

const SpeakerComponent = ({ data }) => {
  const [loading, setLoading] = useState(false);
  return (
    <DeviceCard title={data.deviceName} onReload={null} isLoading={loading}>
      <Flex gap="small" vertical align="center">
        <SpeakerSVG />
      </Flex>
    </DeviceCard>
  );
};

export default SpeakerComponent;
