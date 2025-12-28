// src/components/nodes/ObservationNode.jsx
import React from "react";
import { Handle, Position } from "reactflow";

export default function ObservationNode({ data, selected }) {
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
            ? "2px solid rgba(255, 255, 255, 0.6)"
            : "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "24px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: selected
            ? "0 8px 32px rgba(255, 255, 255, 0.2)"
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
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)",
            borderRadius: "32px",
            pointerEvents: "none",
            opacity: selected ? 1 : 0.5,
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
          {data.text || "Observation"}
        </div>

        {/* Timestamp */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            fontSize: "9px",
            color: "#64748B",
            fontWeight: 500,
          }}
        >
          {new Date(data.timestamp).toLocaleDateString()}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
}
