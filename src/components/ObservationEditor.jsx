// src/components/ObservationEditor.jsx - Mode 1 (Planet Edit Focus)
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { db } from "../lib/db";

export default function ObservationEditor({
  node,
  onSwitchToReflections,
  onUpdate,
}) {
  const [title, setTitle] = useState(node.text || "");
  const [state, setState] = useState(
    node.state || (node.type === "O" ? "present" : "present")
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

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px",
        maxWidth: "90vw",
        maxHeight: "80vh",
        background:
          "linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 36, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        border: "2px solid rgba(108, 99, 255, 0.4)",
        borderRadius: "20px",
        padding: "32px",
        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          paddingBottom: "20px",
          borderBottom: "1px solid rgba(108, 99, 255, 0.2)",
        }}
      >
        <div
          style={{
            fontSize: "32px",
            marginBottom: "8px",
          }}
        >
          {node.type === "O" ? "👁️" : "⚡"}
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 700,
            color: "#E6EEF8",
          }}
        >
          {node.type === "O" ? "Observation" : "Action"}
        </h2>
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: "13px",
            color: "#94A3B8",
            fontStyle: "italic",
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
            marginBottom: "10px",
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
            padding: "14px",
            background: "rgba(15, 23, 36, 0.8)",
            border: "1px solid rgba(108, 99, 255, 0.3)",
            borderRadius: "10px",
            color: "#E6EEF8",
            fontSize: "15px",
            fontFamily: "inherit",
            resize: "vertical",
            outline: "none",
            lineHeight: "1.6",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#6C63FF";
            e.target.style.boxShadow = "0 0 0 2px rgba(108, 99, 255, 0.2)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(108, 99, 255, 0.3)";
            e.target.style.boxShadow = "none";
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
            marginBottom: "10px",
          }}
        >
          {node.type === "O" ? "When" : "Temporal State"}
        </label>
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          {node.type === "O" ? (
            <>
              <button
                onClick={() => handleStateChange("present")}
                style={{
                  flex: 1,
                  padding: "12px",
                  background:
                    state === "present" ? "#10B981" : "rgba(16, 185, 129, 0.2)",
                  border: `2px solid ${
                    state === "present" ? "#10B981" : "rgba(16, 185, 129, 0.4)"
                  }`,
                  borderRadius: "10px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                Present
              </button>
              <button
                onClick={() => handleStateChange("past")}
                style={{
                  flex: 1,
                  padding: "12px",
                  background:
                    state === "past" ? "#64748B" : "rgba(100, 116, 139, 0.2)",
                  border: `2px solid ${
                    state === "past" ? "#64748B" : "rgba(100, 116, 139, 0.4)"
                  }`,
                  borderRadius: "10px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.2s",
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
                  padding: "12px",
                  background:
                    state === "past" ? "#64748B" : "rgba(100, 116, 139, 0.2)",
                  border: `2px solid ${
                    state === "past" ? "#64748B" : "rgba(100, 116, 139, 0.4)"
                  }`,
                  borderRadius: "10px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                Past
              </button>
              <button
                onClick={() => handleStateChange("present")}
                style={{
                  flex: 1,
                  padding: "12px",
                  background:
                    state === "present" ? "#10B981" : "rgba(16, 185, 129, 0.2)",
                  border: `2px solid ${
                    state === "present" ? "#10B981" : "rgba(16, 185, 129, 0.4)"
                  }`,
                  borderRadius: "10px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                Present
              </button>
              <button
                onClick={() => handleStateChange("future")}
                style={{
                  flex: 1,
                  padding: "12px",
                  background:
                    state === "future" ? "#3B82F6" : "rgba(59, 130, 246, 0.2)",
                  border: `2px solid ${
                    state === "future" ? "#3B82F6" : "rgba(59, 130, 246, 0.4)"
                  }`,
                  borderRadius: "10px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.2s",
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
          padding: "12px",
          background: "rgba(30, 41, 59, 0.4)",
          borderRadius: "8px",
          border: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <div
          style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}
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
          marginTop: "auto",
        }}
      >
        {hasChanges && (
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "14px",
              background: "rgba(16, 185, 129, 0.2)",
              border: "2px solid #10B981",
              borderRadius: "10px",
              color: "#10B981",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#10B981";
              e.target.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(16, 185, 129, 0.2)";
              e.target.style.color = "#10B981";
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
            padding: "14px",
            background: title.trim()
              ? "linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)"
              : "rgba(30, 41, 59, 0.6)",
            border: "none",
            borderRadius: "10px",
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
              e.target.style.boxShadow = "0 6px 24px rgba(108, 99, 255, 0.6)";
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
  );
}
