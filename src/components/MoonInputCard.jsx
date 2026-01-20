// src/components/MoonInputCard.jsx - V2 with 4 Dimensions
import React, { useState } from "react";
import { moonConfig, lenses } from "../seedData";

export default function MoonInputCard({ dimension, onSave, onCancel }) {
  const [text, setText] = useState("");
  const [selectedLenses, setSelectedLenses] = useState([]);
  const dimensionConfig = moonConfig.dimension[dimension];

  const toggleLens = (lensId) => {
    setSelectedLenses((prev) =>
      prev.includes(lensId)
        ? prev.filter((id) => id !== lensId)
        : [...prev, lensId],
    );
  };

  const handleSave = () => {
    if (text.trim()) {
      onSave({
        text: text.trim(),
        lensesUsed: selectedLenses,
      });
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "450px",
        maxWidth: "90vw",
        background:
          "linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 36, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        border: `2px solid ${dimensionConfig.color}`,
        borderRadius: "16px",
        padding: "24px",
        boxShadow: `0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px ${dimensionConfig.color}40`,
        animation: "scaleIn 0.3s ease",
        zIndex: 300,
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: `1px solid ${dimensionConfig.color}40`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: dimensionConfig.color,
              boxShadow: `0 0 12px ${dimensionConfig.color}80`,
            }}
          />
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 600,
              color: dimensionConfig.color,
              textTransform: "capitalize",
            }}
          >
            {dimensionConfig.name} Reflection
          </h3>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#94A3B8",
            fontStyle: "italic",
          }}
        >
          {dimensionConfig.description}
        </p>
      </div>

      {/* Text Input */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 600,
            color: "#E6EEF8",
            marginBottom: "8px",
          }}
        >
          Reflection Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`${dimensionConfig.description}`}
          autoFocus
          rows={4}
          style={{
            width: "100%",
            padding: "12px",
            background: "rgba(15, 23, 36, 0.8)",
            border: `1px solid ${dimensionConfig.color}40`,
            borderRadius: "8px",
            color: "#E6EEF8",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical",
            outline: "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = dimensionConfig.color;
            e.target.style.boxShadow = `0 0 0 2px ${dimensionConfig.color}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = `${dimensionConfig.color}40`;
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Lens Selector */}
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 600,
            color: "#E6EEF8",
            marginBottom: "10px",
          }}
        >
          Interpretive Lenses (Optional)
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {lenses.map((lens) => (
            <button
              key={lens.id}
              onClick={() => toggleLens(lens.id)}
              title={lens.promptText}
              style={{
                padding: "8px 14px",
                background: selectedLenses.includes(lens.id)
                  ? lens.color
                  : "rgba(30, 41, 59, 0.6)",
                border: `1px solid ${
                  selectedLenses.includes(lens.id)
                    ? lens.color
                    : "rgba(148, 163, 184, 0.3)"
                }`,
                borderRadius: "8px",
                color: selectedLenses.includes(lens.id) ? "#fff" : "#E6EEF8",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: selectedLenses.includes(lens.id) ? 600 : 500,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!selectedLenses.includes(lens.id)) {
                  e.target.style.background = `${lens.color}20`;
                  e.target.style.borderColor = lens.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedLenses.includes(lens.id)) {
                  e.target.style.background = "rgba(30, 41, 59, 0.6)";
                  e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                }
              }}
            >
              {lens.label}
            </button>
          ))}
        </div>
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: "11px",
            color: "#64748B",
            fontStyle: "italic",
          }}
        >
          Select the perspectives you're using to make sense of this
        </p>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
        }}
      >
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "12px",
            background: "transparent",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            borderRadius: "8px",
            color: "#94A3B8",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(148, 163, 184, 0.1)";
            e.target.style.borderColor = "#94A3B8";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          style={{
            flex: 1,
            padding: "12px",
            background: text.trim()
              ? `linear-gradient(135deg, ${dimensionConfig.color} 0%, ${dimensionConfig.color}CC 100%)`
              : "rgba(30, 41, 59, 0.6)",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            cursor: text.trim() ? "pointer" : "not-allowed",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.2s",
            boxShadow: text.trim()
              ? `0 4px 16px ${dimensionConfig.color}40`
              : "none",
            opacity: text.trim() ? 1 : 0.5,
          }}
          onMouseEnter={(e) => {
            if (text.trim()) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = `0 6px 24px ${dimensionConfig.color}60`;
            }
          }}
          onMouseLeave={(e) => {
            if (text.trim()) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = `0 4px 16px ${dimensionConfig.color}40`;
            }
          }}
        >
          Save Reflection
        </button>
      </div>

      {/* Keyboard Hint */}
      <div
        style={{
          marginTop: "12px",
          fontSize: "11px",
          color: "#64748B",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        Press ESC to cancel
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes scaleIn {
          from {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
