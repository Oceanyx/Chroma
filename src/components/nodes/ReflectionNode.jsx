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
  const isOrbiting = !data.isLocked;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: color,
          width: 8,
          height: 8,
          border: "2px solid #fff",
        }}
      />
      <div
        className={isOrbiting ? "reflection-orbit" : ""}
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
          transition: isOrbiting ? "none" : "all 0.2s ease",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 700,
          color: "#fff",
          position: "relative",
        }}
      >
        {/* Glow effect for orbiting nodes */}
        {isOrbiting && (
          <div
            style={{
              position: "absolute",
              inset: "-8px",
              background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
              borderRadius: "50%",
              pointerEvents: "none",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        )}

        <span style={{ position: "relative", zIndex: 1 }}>R</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: color,
          width: 8,
          height: 8,
          border: "2px solid #fff",
        }}
      />
    </>
  );
}
