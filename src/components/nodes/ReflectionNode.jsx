// src/components/nodes/ReflectionNode.jsx
import React from "react";
import { Handle, Position } from "reactflow";

const domainColors = {
  private: "#A78BFA",
  public: "#10B981",
  abstract: "#60A5FA",
};

export default function ReflectionNode({ data, selected }) {
  const color = domainColors[data.domain] || domainColors.private;

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        style={{
          width: "48px",
          height: "48px",
          background: color,
          border: selected ? "2px solid #fff" : "none",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: selected
            ? `0 4px 16px ${color}80`
            : `0 2px 8px ${color}60`,
          transition: "all 0.2s ease",
          cursor: "pointer",
          fontSize: "20px",
        }}
      >
        {data.domain === "private"
          ? "❤️"
          : data.domain === "public"
          ? "💬"
          : "🧠"}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
}
