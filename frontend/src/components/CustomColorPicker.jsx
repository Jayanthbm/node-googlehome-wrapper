import { Button, Space, Tooltip } from "antd";
import React from "react";

const CustomColorPicker = ({ colors, selectedColor, onChange }) => {
  return (
    <Space wrap>
      {Object.entries(colors).length > 0 ? Object.entries(colors).map(([key, value]) => (
         <Tooltip
          title={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
          key={key}
        >
          <Button
            shape="circle"
            style={{
              backgroundColor: value,
              border: selectedColor === value ? "2px solid #000" : "none",
              width: "30px",
              height: "30px",
            }}
            onClick={() => onChange(key,value)}
          />
        </Tooltip>
      )) : (
          <>
            Add Colors to configuration
          </>
      )}
    </Space>
  );
};

export default CustomColorPicker;
