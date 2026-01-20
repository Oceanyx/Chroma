// src/components/ObservationEditor.jsx - V2 Immersive with Huge Planet
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import Planet from "./Planet";
import { db } from "../lib/db";

export default function ObservationEditor({
  node,
  onSwitchToReflections,
  onUpdate,
}) {
  const [title, setTitle] = useState(node.text || "");
  const [state, setState] = useState(
    node.state || (node.type === "O" ? "present" : "present"),
  );
  const [hasChanges, setHasChanges] = useState(false);

  const handleTitleChange = (value) => {
    setTitle(value);
    setHasChanges(true);
  };

  const handleStateChange = (value) => {
    setState(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (title.trim()) {
      await db.nodes.update(node.id, {
        text: title.trim(),
        state: state,
      });
      onUpdate();
      setHasChanges(false);
    }
  };

  const handleContinue = async () => {
    if (hasChanges) {
      await handleSave();
    }
    onSwitchToReflections();
  };

  // Create massive planet for background (5x normal size)
  const hugePlanet = {
    ...node,
    position: {
      x: window.innerWidth * 0.15 - 125, // Position at 15% from left
      y: window.innerHeight / 2 - 125,
    },
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "rgba(10, 15, 30, 0.6)",
      }}
    >
      {/* Huge Planet Background */}
      <div
        style={{
          position: "absolute",
          left: "15%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(5)",
          opacity: 0.4,
          filter: "blur(20px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg width="250" height="250" style={{ overflow: "visible" }}>
          <Planet node={hugePlanet} isHovered={false} isSelected={false} />
        </svg>
      </div>

      {/* Pulsing Glow for State */}
      {state === "present" && (
        <div
          style={{
            position: "absolute",
            left: "15%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
            animation: "pulse 2s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Glassmorphic Form Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginLeft: "25%", // Push card to right side
          width: "500px",
          maxWidth: "45vw",
          maxHeight: "80vh",
          background: "rgba(30, 41, 59, 0.85)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "24px",
          padding: "40px",
          boxShadow:
            "0 32px 96px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            paddingBottom: "24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
              color: "#E6EEF8",
              marginBottom: "8px",
            }}
          >
            {node.type === "O" ? "Observation" : "Action"}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#94A3B8",
              fontStyle: "italic",
              lineHeight: "1.5",
            }}
          >
            {node.type === "O"
              ? "What did you notice? What actually happened?"
              : "What did you do? What action did you take?"}
          </p>
        </div>

        {/* Title Field */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 600,
              color: "#E6EEF8",
              marginBottom: "12px",
              letterSpacing: "0.3px",
            }}
          >
            Description
          </label>
          <textarea
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={
              node.type === "O"
                ? "Describe what you observed..."
                : "Describe the action you took..."
            }
            autoFocus
            rows={5}
            style={{
              width: "100%",
              padding: "16px",
              background: "rgba(15, 23, 36, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              color: "#E6EEF8",
              fontSize: "15px",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              lineHeight: "1.6",
              boxSizing: "border-box",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(108, 99, 255, 0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(108, 99, 255, 0.1)";
              e.target.style.background = "rgba(15, 23, 36, 0.9)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.target.style.boxShadow = "none";
              e.target.style.background = "rgba(15, 23, 36, 0.7)";
            }}
          />
        </div>

        {/* State Selector */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 600,
              color: "#E6EEF8",
              marginBottom: "12px",
              letterSpacing: "0.3px",
            }}
          >
            {node.type === "O" ? "When" : "Temporal State"}
          </label>
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            {node.type === "O" ? (
              <>
                <button
                  onClick={() => handleStateChange("present")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background:
                      state === "present"
                        ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                        : "rgba(16, 185, 129, 0.15)",
                    border: `2px solid ${
                      state === "present"
                        ? "#10B981"
                        : "rgba(16, 185, 129, 0.3)"
                    }`,
                    borderRadius: "12px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    boxShadow:
                      state === "present"
                        ? "0 4px 16px rgba(16, 185, 129, 0.3)"
                        : "none",
                  }}
                >
                  Present
                </button>
                <button
                  onClick={() => handleStateChange("past")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background:
                      state === "past"
                        ? "linear-gradient(135deg, #64748B 0%, #475569 100%)"
                        : "rgba(100, 116, 139, 0.15)",
                    border: `2px solid ${
                      state === "past" ? "#64748B" : "rgba(100, 116, 139, 0.3)"
                    }`,
                    borderRadius: "12px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    boxShadow:
                      state === "past"
                        ? "0 4px 16px rgba(100, 116, 139, 0.3)"
                        : "none",
                  }}
                >
                  Past
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleStateChange("past")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background:
                      state === "past"
                        ? "linear-gradient(135deg, #64748B 0%, #475569 100%)"
                        : "rgba(100, 116, 139, 0.15)",
                    border: `2px solid ${
                      state === "past" ? "#64748B" : "rgba(100, 116, 139, 0.3)"
                    }`,
                    borderRadius: "12px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    boxShadow:
                      state === "past"
                        ? "0 4px 16px rgba(100, 116, 139, 0.3)"
                        : "none",
                  }}
                >
                  Past
                </button>
                <button
                  onClick={() => handleStateChange("present")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background:
                      state === "present"
                        ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                        : "rgba(16, 185, 129, 0.15)",
                    border: `2px solid ${
                      state === "present"
                        ? "#10B981"
                        : "rgba(16, 185, 129, 0.3)"
                    }`,
                    borderRadius: "12px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    boxShadow:
                      state === "present"
                        ? "0 4px 16px rgba(16, 185, 129, 0.3)"
                        : "none",
                  }}
                >
                  Present
                </button>
                <button
                  onClick={() => handleStateChange("future")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background:
                      state === "future"
                        ? "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                        : "rgba(59, 130, 246, 0.15)",
                    border: `2px solid ${
                      state === "future" ? "#3B82F6" : "rgba(59, 130, 246, 0.3)"
                    }`,
                    borderRadius: "12px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    boxShadow:
                      state === "future"
                        ? "0 4px 16px rgba(59, 130, 246, 0.3)"
                        : "none",
                  }}
                >
                  Future
                </button>
              </>
            )}
          </div>
        </div>

        {/* Timestamp Display */}
        <div
          style={{
            padding: "14px",
            background: "rgba(15, 23, 36, 0.5)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#94A3B8",
              marginBottom: "6px",
              fontWeight: 500,
            }}
          >
            Created
          </div>
          <div style={{ fontSize: "14px", color: "#E6EEF8", fontWeight: 500 }}>
            {node.timestamp
              ? new Date(node.timestamp).toLocaleString()
              : "Just now"}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          {hasChanges && (
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: "16px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "2px solid #10B981",
                borderRadius: "12px",
                color: "#10B981",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background =
                  "linear-gradient(135deg, #10B981 0%, #059669 100%)";
                e.target.style.color = "#fff";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(16, 185, 129, 0.15)";
                e.target.style.color = "#10B981";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Save Changes
            </button>
          )}
          <button
            onClick={handleContinue}
            disabled={!title.trim()}
            style={{
              flex: 1,
              padding: "16px",
              background: title.trim()
                ? "linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)"
                : "rgba(30, 41, 59, 0.6)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              cursor: title.trim() ? "pointer" : "not-allowed",
              fontSize: "15px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
              boxShadow: title.trim()
                ? "0 4px 16px rgba(108, 99, 255, 0.4)"
                : "none",
              opacity: title.trim() ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (title.trim()) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 28px rgba(108, 99, 255, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (title.trim()) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 16px rgba(108, 99, 255, 0.4)";
              }
            }}
          >
            View Reflections <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.15;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.25;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
