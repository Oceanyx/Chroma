// src/components/ReflectionMode.jsx - Orchestrates Mode 1 & 2
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import ObservationEditor from "./ObservationEditor";
import ReflectionSpace from "./ReflectionSpace";

export default function ReflectionMode({
  parentNode,
  nodes,
  onExit,
  onNodesUpdate,
}) {
  // Determine initial mode
  const childMoons = nodes.filter((n) => n.parentId === parentNode.id);
  const hasReflections = childMoons.length > 0;

  // Mode: 'observation' or 'reflection'
  const [mode, setMode] = useState(
    hasReflections ? "reflection" : "observation"
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onExit();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onExit]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 36, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Exit Button */}
      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: "20px",
          right: "30px",
          width: "44px",
          height: "44px",
          background: "rgba(30, 41, 59, 0.9)",
          border: "1px solid rgba(239, 68, 68, 0.5)",
          borderRadius: "50%",
          color: "#EF4444",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          zIndex: 1001,
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.background = "rgba(239, 68, 68, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.background = "rgba(30, 41, 59, 0.9)";
        }}
      >
        <X size={24} />
      </button>

      {/* Mode 1: Observation Editor */}
      {mode === "observation" && (
        <ObservationEditor
          node={parentNode}
          onSwitchToReflections={() => setMode("reflection")}
          onUpdate={onNodesUpdate}
        />
      )}

      {/* Mode 2: Reflection Space */}
      {mode === "reflection" && (
        <ReflectionSpace
          parentNode={parentNode}
          nodes={nodes}
          onSwitchToObservation={() => setMode("observation")}
          onNodesUpdate={onNodesUpdate}
        />
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
