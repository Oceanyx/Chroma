// src/components/nodes/ActionNode.jsx
import React from "react";
import { Handle, Position } from "reactflow";

const stateColors = {
  past: "#94A3B8",
  present: "#10B981",
  future: "#F59E0B",
};

export default function ActionNode({ data, selected }) {
  const color = stateColors[data.state] || stateColors.present;

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        style={{
          width: "140px",
          height: "140px",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)",
          border: selected
            ? `2px solid ${color}`
            : `1px solid rgba(255, 255, 255, 0.15)`,
          clipPath:
            "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: selected
            ? `0 8px 32px ${color}40`
            : "0 4px 16px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s ease",
          cursor: "pointer",
          position: "relative",
        }}
      >
        {/* Halo effect */}
        <div
          style={{
            position: "absolute",
            inset: "-12px",
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
            clipPath:
              "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            pointerEvents: "none",
            opacity: selected ? 1 : 0.5,
          }}
        />

        {/* State indicator */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />

        {/* Content */}
        <div
          style={{
            fontSize: "13px",
            color: "#E6EEF8",
            textAlign: "center",
            lineHeight: "1.4",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            position: "relative",
            zIndex: 1,
          }}
        >
          {data.text || "Action"}
        </div>

        {/* State label */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            fontSize: "9px",
            color,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {data.state}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
}
