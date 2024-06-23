// src/SettingsComponent.jsx
import {
  DownloadOutlined,
  HomeOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Flex,
  Input,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import React from "react";
import { exportConfig } from "../utils";

const { TextArea } = Input;

const SettingsComponent = ({
  backendApiUrl,
  handleApiUrlChange,
  saveApiUrl,
  deviceConfig,
  handleConfigChange,
  saveDeviceConfig,
  closeSettings,
  setDeviceConfig,
}) => {
  const uploadProps = {
    name: "file",
    accept: ".json",
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setDeviceConfig(content);
      };
      reader.readAsText(file);
      // Return false to prevent antd from uploading the file
      return false;
    },
  };
  return (
    <>
      <Breadcrumb
        items={[
          {
            href: "/",
            title: (
              <>
                <HomeOutlined />
                <span>Home</span>
              </>
            ),
          },
          {
            title: "Configuration",
          },
        ]}
      />
      <Space.Compact
        style={{
          width: "100%",
          marginTop: "1rem",
        }}
      >
        <Typography.Title level={5}>Backend API URL</Typography.Title>
      </Space.Compact>

      <Space.Compact
        style={{
          width: "100%",
          marginBottom: "1rem",
        }}
      >
        <Input
          placeholder="Enter backend API URL"
          value={backendApiUrl}
          onChange={handleApiUrlChange}
        />
        <Button type="primary" onClick={saveApiUrl}>
          Submit
        </Button>
      </Space.Compact>
      <Typography.Title level={5}>Device Configuration</Typography.Title>
      <Space.Compact
        style={{
          width: "100%",
          marginBottom: "1rem",
        }}
      >
        <TextArea
          placeholder="Enter device configuration"
          value={deviceConfig}
          onChange={handleConfigChange}
          rows={10}
        />
      </Space.Compact>
      <Typography.Title level={5}>Upload Configuration</Typography.Title>
      <Space.Compact
        style={{
          width: "100%",
          marginBottom: "1rem",
        }}
      >
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Space.Compact>
      <Flex gap="small" wrap>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={saveDeviceConfig}
        >
          Save
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => {
            exportConfig();
            message.success("Configuration exported successfully");
          }}
        >
          Export
        </Button>
        <Button type="primary" danger onClick={closeSettings}>
          Close
        </Button>
      </Flex>
    </>
  );
};

export default SettingsComponent;
