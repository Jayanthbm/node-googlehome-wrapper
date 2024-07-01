import {
  BellOutlined,
  CalendarOutlined,
  FastBackwardOutlined,
  FastForwardOutlined,
  FieldTimeOutlined,
  PlayCircleOutlined,
  PlusCircleOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { Button, Flex, Popover, Slider, Tooltip } from "antd";
import React, { useState } from "react";
import DeviceCard from "./DeviceCard";
import { SpeakerSVG } from "./SvgComponets";

const SpeakerComponent = ({ data }) => {
  const [loading, setLoading] = useState(false);
  return (
    <DeviceCard title={data.deviceName} onReload={null} isLoading={loading}>
      <Flex gap="small" vertical align="center">
        <Flex gap="small">
          <SpeakerSVG />
          <Flex gap="small" vertical>
            <Flex gap="small">
              <Tooltip title="Previous Track">
                <Button
                  shape="square"
                  style={{
                    width: 30,
                    height: 30,
                    marginTop: 10,
                  }}
                  icon={<FastBackwardOutlined />}
                />
              </Tooltip>
              <Tooltip title="Play/Pause">
                <Button
                  shape="square"
                  style={{
                    width: 30,
                    height: 30,
                    marginTop: 10,
                  }}
                  icon={<PlayCircleOutlined />}
                />
              </Tooltip>
              <Tooltip title="Next Track">
                <Button
                  shape="square"
                  style={{
                    width: 30,
                    height: 30,
                    marginTop: 10,
                  }}
                  icon={<FastForwardOutlined />}
                />
              </Tooltip>

              <Tooltip title="Play with Service">
                <Popover>
                  <Button
                    shape="square"
                    style={{
                      width: 30,
                      height: 30,
                      marginTop: 10,
                    }}
                    icon={<PlusCircleOutlined />}
                  />
                </Popover>
              </Tooltip>
            </Flex>
            <Flex gap="small">
              <Tooltip title="Broadcast">
                <Popover>
                  <Button
                    shape="square"
                    style={{
                      width: 30,
                      height: 30,
                      marginTop: 10,
                    }}
                    icon={<SoundOutlined />}
                  />
                </Popover>
              </Tooltip>
              <Tooltip title="Timer">
                <Popover>
                  <Button
                    shape="square"
                    style={{
                      width: 30,
                      height: 30,
                      marginTop: 10,
                    }}
                    icon={<FieldTimeOutlined />}
                  />
                </Popover>
              </Tooltip>
              <Tooltip title="Reminder">
                <Popover>
                  <Button
                    shape="square"
                    style={{
                      width: 30,
                      height: 30,
                      marginTop: 10,
                    }}
                    icon={<BellOutlined />}
                  />
                </Popover>
              </Tooltip>
              <Tooltip title="Calendar">
                <Popover>
                  <Button
                    shape="square"
                    style={{
                      width: 30,
                      height: 30,
                      marginTop: 10,
                    }}
                    icon={<CalendarOutlined />}
                  />
                </Popover>
              </Tooltip>
            </Flex>
          </Flex>
        </Flex>
        <Slider
          dots={true}
          style={{
            width: "150px",
          }}
          min={1}
          max={parseInt(100, 10)}
          keyboard={true}
          step={1}
          marks={{
            5: "5",
            20: "20",
            40: "40",
            60: "60",
            75: "75",
            95: "95",
          }}
        />
      </Flex>
    </DeviceCard>
  );
};

export default SpeakerComponent;
