// src/components/MainDock.jsx
import React, { useState } from "react";
import { Eye, Zap } from "lucide-react";

export default function MainDock({ onCreateObservation, onCreateAction }) {
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "16px",
        padding: "14px 20px",
        background:
          "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 36, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(108, 99, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        zIndex: 100,
      }}
    >
      {/* Observation Button */}
      <button
        onClick={onCreateObservation}
        onMouseEnter={() => setHoveredButton("observation")}
        onMouseLeave={() => setHoveredButton(null)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 20px",
          background:
            hoveredButton === "observation"
              ? "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)"
              : "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.1) 100%)",
          border: `2px solid ${
            hoveredButton === "observation"
              ? "#3B82F6"
              : "rgba(59, 130, 246, 0.4)"
          }`,
          borderRadius: "12px",
          color: "#E6EEF8",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: 600,
          transition: "all 0.2s ease",
          transform:
            hoveredButton === "observation"
              ? "translateY(-2px)"
              : "translateY(0)",
          boxShadow:
            hoveredButton === "observation"
              ? "0 6px 20px rgba(59, 130, 246, 0.5)"
              : "0 2px 8px rgba(59, 130, 246, 0.2)",
        }}
      >
        <Eye size={20} />
        Observation
      </button>

      {/* Divider */}
      <div
        style={{
          width: "1px",
          height: "48px",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(148, 163, 184, 0.3) 50%, transparent 100%)",
        }}
      />

      {/* Action Button */}
      <button
        onClick={onCreateAction}
        onMouseEnter={() => setHoveredButton("action")}
        onMouseLeave={() => setHoveredButton(null)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 20px",
          background:
            hoveredButton === "action"
              ? "linear-gradient(135deg, #EA580C 0%, #FB923C 100%)"
              : "linear-gradient(135deg, rgba(234, 88, 12, 0.2) 0%, rgba(251, 146, 60, 0.1) 100%)",
          border: `2px solid ${
            hoveredButton === "action" ? "#EA580C" : "rgba(234, 88, 12, 0.4)"
          }`,
          borderRadius: "12px",
          color: "#E6EEF8",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: 600,
          transition: "all 0.2s ease",
          transform:
            hoveredButton === "action" ? "translateY(-2px)" : "translateY(0)",
          boxShadow:
            hoveredButton === "action"
              ? "0 6px 20px rgba(234, 88, 12, 0.5)"
              : "0 2px 8px rgba(234, 88, 12, 0.2)",
        }}
      >
        <Zap size={20} />
        Action
      </button>

      {/* Hint Text */}
      <div
        style={{
          position: "absolute",
          bottom: "-30px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "11px",
          color: "#64748B",
          whiteSpace: "nowrap",
          fontStyle: "italic",
        }}
      >
        Double-click a node to add reflections
      </div>
    </div>
  );
}
