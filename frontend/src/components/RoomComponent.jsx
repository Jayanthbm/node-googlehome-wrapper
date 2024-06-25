import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import React from "react";
import CardGrid from "./CardGrid";
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
      <CardGrid>
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
      </CardGrid>
    </>
  );
};

export default RoomComponent;
