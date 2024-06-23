// src/AppHeader.jsx
import {
  SettingOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import React from "react";

const { Header } = Layout;

const AppHeader = ({ onCogToggle }) => {

  return (
    <Header className="app-header">
      <div className="title">J-Googlehome</div>
      <div className="icons">
        <SettingOutlined className="icon" onClick={onCogToggle} />
      </div>
    </Header>
  );
};

export default AppHeader;
