import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Flex } from "antd";
import React from "react";
import FanComponent from "./FanComponent";
import LightComponent from "./LightComponent";
import OutletComponent from "./OutletComponent";
import SpeakerComponent from "./SpeakerComponent";

const RoomComponent = ({ name, data }) => {
  return (
    <>
      <Breadcrumb
        items={[
          {
            title: (
              <>
                <HomeOutlined />
                <span>{name}</span>
              </>
            ),
          },
        ]}
      />
      <Flex gap="middle" align="start" wrap>
        {data.map((device, index) => {
          switch (device.deviceType) {
            case "Fan": {
              return <FanComponent data={device} key={index} />;
            }
            case "Outlet": {
              return <OutletComponent data={device} key={index} />;
            }
            case "Light": {
              return <LightComponent data={device} key={index} />;
            }
            case "Speaker": {
              return <SpeakerComponent data={device} key={index} />;
            }
            default: {
              return <></>;
            }
          }
        })}
      </Flex>
    </>
  );
};

export default RoomComponent;
