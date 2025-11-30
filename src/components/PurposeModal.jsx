// src/components/PurposeModal.jsx
import React from "react";
import { X, Edit2, Target } from "lucide-react";

export default function PurposeModal({ purposeData, onClose, onEdit }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: "500px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          background: "#0F1724",
          borderRadius: "16px",
          border: "1px solid rgba(108, 99, 255, 0.3)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          color: "#E6EEF8",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Target size={20} color="#6C63FF" />
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
              Session Purpose
            </h2>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onEdit}
              style={{
                padding: "6px 12px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#94A3B8",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "#6C63FF";
                e.target.style.color = "#6C63FF";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
                e.target.style.color = "#94A3B8";
              }}
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                fontSize: "24px",
                cursor: "pointer",
                padding: "0 8px",
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#94A3B8",
                fontWeight: 500,
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Map Title
            </label>
            <div
              style={{
                fontSize: "18px",
                color: "#E6EEF8",
                fontWeight: 600,
              }}
            >
              {purposeData.title || "Untitled Map"}
            </div>
          </div>

          {purposeData.purpose && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#94A3B8",
                  fontWeight: 500,
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Purpose
              </label>
              <div
                style={{
                  fontSize: "14px",
                  color: "#CBD5E1",
                  lineHeight: "1.6",
                  padding: "12px",
                  background: "rgba(30, 41, 59, 0.4)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {purposeData.purpose}
              </div>
            </div>
          )}

          {purposeData.currentState && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#94A3B8",
                  fontWeight: 500,
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Current State
              </label>
              <div
                style={{
                  fontSize: "14px",
                  color: "#CBD5E1",
                  lineHeight: "1.6",
                  padding: "12px",
                  background: "rgba(30, 41, 59, 0.4)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {purposeData.currentState}
              </div>
            </div>
          )}

          {purposeData.orientationQuestion && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#94A3B8",
                  fontWeight: 500,
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Guiding Question
              </label>
              <div
                style={{
                  fontSize: "14px",
                  color: "#CBD5E1",
                  lineHeight: "1.6",
                  padding: "12px",
                  background: "rgba(30, 41, 59, 0.4)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {purposeData.orientationQuestion}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
