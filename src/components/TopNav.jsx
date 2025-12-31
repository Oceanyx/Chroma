// src/components/TopNav.jsx
import React, { useState } from "react";
import {
  Search,
  MousePointer,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

export default function TopNav({ purposeData, tool, onToolChange }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div
      style={{
        height: "60px",
        background: "linear-gradient(180deg, #1E293B 0%, #1A2332 100%)",
        borderBottom: "1px solid rgba(108, 99, 255, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Left: Logo + Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <img
          src="/logo.PNG"
          alt="Chroma Logo"
          style={{
            width: "36px",
            height: "36px",
            filter: "drop-shadow(0 2px 6px rgba(108, 99, 255, 0.4))",
          }}
        />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #6C63FF 0%, #4D9FFF 50%, #A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.3px",
            }}
          >
            Chroma
          </h1>
          {purposeData?.title && (
            <p
              style={{
                margin: "2px 0 0 0",
                fontSize: "11px",
                color: "#94A3B8",
                fontWeight: 500,
              }}
            >
              {purposeData.title}
            </p>
          )}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div
        style={{
          position: "relative",
          width: "320px",
        }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#64748B",
            pointerEvents: "none",
          }}
        />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search nodes..."
          style={{
            width: "100%",
            padding: "8px 12px 8px 36px",
            background: "rgba(15, 23, 36, 0.6)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: "8px",
            color: "#E6EEF8",
            fontSize: "13px",
            outline: "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#6C63FF";
            e.target.style.boxShadow = "0 0 0 2px rgba(108, 99, 255, 0.2)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(148, 163, 184, 0.2)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Right: Tools */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {/* Tool Selector */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "4px",
            background: "rgba(15, 23, 36, 0.6)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <button
            onClick={() => onToolChange("select")}
            style={{
              padding: "6px 12px",
              background: tool === "select" ? "#6C63FF" : "transparent",
              border: "none",
              borderRadius: "6px",
              color: tool === "select" ? "#fff" : "#94A3B8",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            <MousePointer size={14} />
            Select
          </button>
          <button
            onClick={() => onToolChange("hand")}
            style={{
              padding: "6px 12px",
              background: tool === "hand" ? "#6C63FF" : "transparent",
              border: "none",
              borderRadius: "6px",
              color: tool === "hand" ? "#fff" : "#94A3B8",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            <Hand size={14} />
            Pan
          </button>
        </div>

        {/* Keyboard Hint */}
        <div
          style={{
            fontSize: "10px",
            color: "#64748B",
            padding: "4px 8px",
            background: "rgba(100, 116, 139, 0.1)",
            borderRadius: "4px",
            border: "1px solid rgba(100, 116, 139, 0.2)",
          }}
        >
          Space
        </div>
      </div>
    </div>
  );
}
