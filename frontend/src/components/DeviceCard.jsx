import {
  CheckCircleFilled,
  ClockCircleOutlined,
  ReloadOutlined,
  StopFilled,
  WarningFilled,
} from "@ant-design/icons";
import { Card, Divider, Tooltip, Typography, message } from "antd";
import React from "react";
const { Text } = Typography;

const iconStyle = {
  fontSize: 20,
};
const RenderIcon = (status, deviceName) => {
  let statusText;
  if (status === "ON") {
    statusText = `${deviceName} is on`;
    return (
      <Tooltip title={statusText}>
        <CheckCircleFilled
          style={{
            ...iconStyle,
            color: "#4CAF50",
          }}
        />
      </Tooltip>
    );
  } else if (status === "OFF") {
    statusText = `${deviceName} is off`;
    return (
      <Tooltip title={statusText}>
        <StopFilled
          style={{
            ...iconStyle,
            color: "#F44336",
          }}
        />
      </Tooltip>
    );
  } else {
    statusText = `${deviceName} is offline`;
    return (
      <Tooltip title={statusText}>
        <WarningFilled
          style={{
            ...iconStyle,
            color: "#9E9E9E",
          }}
        />
      </Tooltip>
    );
  }
};
const DeviceCard = ({ title, isLoading, status, onReload, children, fetchedAt }) => {

  const [messageApi, contextHolder] = message.useMessage();
  return (
    <Card
      title={title}
      bordered={true}
      hoverable={true}
      loading={isLoading}
      extra={
        <>
          {RenderIcon(status, title)}
          <Tooltip title="Refresh">
            {contextHolder}
            <ReloadOutlined
              style={{
                ...iconStyle,
                color: "#00BFFF",
                cursor: isLoading ? "not-allowed" : "pointer",
                marginLeft: "10px",
              }}
              spin={isLoading}
              onClick={async () => {
                if (isLoading) {
                  return;
                } else {
                  messageApi.open({
                    type: "loading",
                    content: `Refreshing ${title} status...`,
                    duration: 0,
                  });
                  let status = await onReload();
                  console.log("status", status);
                  if (status) {
                    messageApi.destroy();
                    message.success(`Refreshed ${title} successfully`);
                  } else {
                    messageApi.destroy();
                    message.error(`Failed to refresh ${title} status`);
                  }
                }
              }}
            />
          </Tooltip>
        </>
      }
    >
      {children}
      <Divider>
        <Tooltip title={"Last fetched time"} placement="bottom">
          <Text>
            <ClockCircleOutlined
              style={{
                marginRight: "5px",
              }}
            />
          </Text>
          <Text keyboard>{new Date(fetchedAt).toLocaleString()}</Text>
        </Tooltip>
      </Divider>
    </Card>
  );
};

export default DeviceCard;