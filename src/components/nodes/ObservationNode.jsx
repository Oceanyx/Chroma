// src/components/nodes/ObservationNode.jsx
import React from "react";
import { Handle, Position } from "reactflow";

export default function ObservationNode({ data, selected }) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "#6C63FF",
          width: 10,
          height: 10,
          border: "2px solid #fff",
        }}
      />
      <div
        style={{
          width: "180px",
          height: "180px",
          background:
            "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.08))",
          backdropFilter: "blur(12px)",
          border: selected
            ? "3px solid rgba(255, 255, 255, 0.8)"
            : "2px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "50%",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: selected
            ? "0 0 40px rgba(255, 255, 255, 0.4), 0 8px 32px rgba(255, 255, 255, 0.2)"
            : "0 0 20px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
          cursor: "pointer",
          position: "relative",
        }}
      >
        {/* Glow halo */}
        <div
          style={{
            position: "absolute",
            inset: "-20px",
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            opacity: selected ? 1 : 0.6,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Content */}
        <div
          style={{
            fontSize: "14px",
            color: "#E6EEF8",
            textAlign: "center",
            lineHeight: "1.5",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            position: "relative",
            zIndex: 1,
            fontWeight: 500,
          }}
        >
          {data.text || "Observation"}
        </div>

        {/* Type Indicator */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 700,
            color: "#fff",
            zIndex: 2,
          }}
        >
          O
        </div>

        {/* Timestamp */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            fontSize: "10px",
            color: "#94A3B8",
            fontWeight: 500,
            opacity: 0.8,
          }}
        >
          {new Date(data.timestamp).toLocaleDateString()}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#6C63FF",
          width: 10,
          height: 10,
          border: "2px solid #fff",
        }}
      />
    </>
  );
}
