import { ReloadOutlined } from "@ant-design/icons";
import { Card, Tooltip, message } from "antd";
import React from "react";

const iconStyle = {
  fontSize: 20,
};

const DeviceCard = ({ title, isLoading, onReload, children }) => {
  const [messageApi, contextHolder] = message.useMessage();
  return (
    <Card
      title={title}
      bordered={true}
      hoverable={false}
      loading={isLoading}
      extra={
        <>
          {onReload ? (
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
          ) : (
            <></>
          )}
        </>
      }
    >
      {children}
    </Card>
  );
};

export default DeviceCard;
