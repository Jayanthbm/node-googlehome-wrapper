import { LoginOutlined, LogoutOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Flex, Tooltip, Typography } from "antd";
import React from "react";
const { Text,Title } = Typography;

const ToggleButton = ({ status, onToggle, isLoading }) => {
  return (
    <Flex gap="small" vertical>
      <Text type="secondary">Power</Text>
      <Tooltip
        title={
          status === "ON"
            ? "Turn off"
            : status === "OFF"
            ? "Turn on"
            : "Offline"
        }
      >
        <Button
          type="primary"
          size="large"
          onClick={onToggle}
          shape="circle"
          className={
            status === "ON"
              ? "off-btn"
              : status === "OFF"
              ? "on-btn"
              : "offline-btn"
          }
          icon={
            status === "ON" ? (
              <LogoutOutlined />
            ) : status === "OFF" ? (
              <LoginOutlined />
            ) : (
              <StopOutlined />
            )
          }
          loading={isLoading}
          disabled={isLoading || status === "OFFLINE"}
        />
      </Tooltip>
      {status === "ON" ? (
        <Text type="secondary">Turn Off</Text>
      ) : (
        <Text type="secondary">Turn On</Text>
      )}
    </Flex>
  );
};

export default ToggleButton;