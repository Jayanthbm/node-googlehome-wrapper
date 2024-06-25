// src/AppHeader.jsx
import {
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Layout, Tooltip } from "antd";
import React from "react";

const { Header } = Layout;

const AppHeader = ({ onCogToggle,onReload }) => {

  return (
    <Header className="app-header">
      <div className="title">J-Googlehome</div>
      <div className="icons">
        <Tooltip title="Configuration">
          <SettingOutlined className="icon" onClick={onCogToggle} />
        </Tooltip>
      </div>
    </Header>
  );
};

export default AppHeader;
