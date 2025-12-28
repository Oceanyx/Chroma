// src/components/ReflectionInput.jsx
import React, { useState } from "react";
import { Send, X } from "lucide-react";
import { getLensesForNodeType } from "../lib/lenses";
import { findLargestGaps } from "../lib/db";

const domainColors = {
  private: "#A78BFA",
  public: "#10B981",
  abstract: "#60A5FA",
};

export default function ReflectionInput({
  parentNode,
  domain,
  existingReflections,
  onComplete,
  onCancel,
}) {
  const [text, setText] = useState("");
  const [selectedLenses, setSelectedLenses] = useState([]);

  const availableLenses = getLensesForNodeType("R");
  const color = domainColors[domain];

  const handleLensToggle = (lens) => {
    if (selectedLenses.find((l) => l.id === lens.id)) {
      setSelectedLenses(selectedLenses.filter((l) => l.id !== lens.id));
    } else {
      setSelectedLenses([...selectedLenses, lens]);
      // Insert prompt into text
      setText((prev) => {
        if (prev.trim()) {
          return `${prev}\n\n${lens.prompt}`;
        }
        return lens.prompt;
      });
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) return;

    // Calculate slot for this reflection
    const occupiedSlots = existingReflections.map((r) => r.slot);
    const availableSlots = findLargestGaps(occupiedSlots, 1);
    const slot = availableSlots[0];

    onComplete({
      domain,
      text: text.trim(),
      lensesUsed: selectedLenses.map((l) => l.id),
      slot,
    });
  };

  return (
    <div
      style={{
        width: "500px",
        maxWidth: "90vw",
        background: "rgba(15, 23, 36, 0.98)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: `2px solid ${color}`,
        boxShadow: `0 8px 32px ${color}40`,
        padding: "24px",
        animation: "slideUp 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            R
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: "#E6EEF8",
              textTransform: "capitalize",
            }}
          >
            {domain} Reflection
          </h3>
        </div>
        <button
          onClick={onCancel}
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

      {/* Lens Rack */}
      <div
        style={{
          marginBottom: "16px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#94A3B8",
            fontWeight: 500,
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Apply Lenses
        </label>
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "8px",
          }}
        >
          {availableLenses.map((lens) => {
            const isSelected = selectedLenses.find((l) => l.id === lens.id);
            return (
              <button
                key={lens.id}
                onClick={() => handleLensToggle(lens)}
                style={{
                  padding: "8px 16px",
                  background: isSelected
                    ? `${color}30`
                    : "rgba(30, 41, 59, 0.6)",
                  border: isSelected
                    ? `1px solid ${color}`
                    : "1px solid rgba(148, 163, 184, 0.3)",
                  borderRadius: "20px",
                  color: isSelected ? color : "#94A3B8",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.color = color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor =
                      "rgba(148, 163, 184, 0.3)";
                    e.currentTarget.style.color = "#94A3B8";
                  }
                }}
              >
                {lens.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What are you noticing?"
        rows={6}
        style={{
          width: "100%",
          padding: "12px",
          background: "rgba(30, 41, 59, 0.6)",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          borderRadius: "8px",
          color: "#E6EEF8",
          fontSize: "14px",
          lineHeight: "1.6",
          outline: "none",
          resize: "vertical",
          fontFamily: "inherit",
          marginBottom: "16px",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = color;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
        }}
      />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        style={{
          width: "100%",
          padding: "12px",
          background: text.trim()
            ? `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`
            : "rgba(30, 41, 59, 0.6)",
          border: "none",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: text.trim() ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.2s",
          opacity: text.trim() ? 1 : 0.5,
        }}
      >
        <Send size={16} />
        Create Reflection
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
