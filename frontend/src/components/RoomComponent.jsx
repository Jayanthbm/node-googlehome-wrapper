import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import React from "react";
import FanComponent from "./FanComponent";
import LightComponent from "./LightComponent";
import OutletComponent from "./OutletComponent";
import SpeakerComponent from "./SpeakerComponent";
import CardGrid from "./CardGrid";

const RoomComponent = ({ name, data, forceReload }) => {
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
              return <FanComponent data={device} forceReload={forceReload} />;
            }
            case "Outlet": {
              return (
                <OutletComponent data={device} forceReload={forceReload} />
              );
            }
            case "Light": {
              return <LightComponent data={device} forceReload={forceReload} />;
            }
            case "Speaker": {
              return (
                <SpeakerComponent data={device} forceReload={forceReload} />
              );
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
