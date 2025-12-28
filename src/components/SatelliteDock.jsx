// src/components/SatelliteDock.jsx
import React, { useState } from "react";
import { Plus, List, X } from "lucide-react";
import GhostMoons from "./GhostMoons";
import ReflectionInput from "./ReflectionInput";

export default function SatelliteDock({
  parentNode,
  existingReflections,
  onAddReflection,
  onClose,
}) {
  const [showGhosts, setShowGhosts] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [listView, setListView] = useState(false);

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    setShowGhosts(false);
  };

  const handleReflectionComplete = (reflectionData) => {
    onAddReflection(reflectionData);
    setSelectedDomain(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Ghost Moons */}
      {showGhosts && (
        <GhostMoons
          parentNode={parentNode}
          existingReflections={existingReflections}
          onSelect={handleDomainSelect}
          onCancel={() => setShowGhosts(false)}
        />
      )}

      {/* Reflection Input Card */}
      {selectedDomain && (
        <ReflectionInput
          parentNode={parentNode}
          domain={selectedDomain}
          existingReflections={existingReflections}
          onComplete={handleReflectionComplete}
          onCancel={() => setSelectedDomain(null)}
        />
      )}

      {/* Main Dock */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "16px 24px",
          background: "rgba(15, 23, 36, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          border: "1px solid rgba(108, 99, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        <button
          onClick={() => setShowGhosts(!showGhosts)}
          style={{
            padding: "12px 20px",
            background: showGhosts
              ? "linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)"
              : "rgba(108, 99, 255, 0.15)",
            border: "1px solid rgba(108, 99, 255, 0.3)",
            borderRadius: "10px",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!showGhosts) {
              e.currentTarget.style.background = "rgba(108, 99, 255, 0.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (!showGhosts) {
              e.currentTarget.style.background = "rgba(108, 99, 255, 0.15)";
            }
          }}
        >
          <Plus size={18} />
          Add Moon
        </button>

        <button
          onClick={() => setListView(!listView)}
          style={{
            padding: "12px",
            background: listView
              ? "rgba(77, 159, 255, 0.25)"
              : "rgba(30, 41, 59, 0.6)",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            borderRadius: "10px",
            color: "#94A3B8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#4D9FFF";
            e.currentTarget.style.color = "#4D9FFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.3)";
            e.currentTarget.style.color = "#94A3B8";
          }}
        >
          <List size={18} />
        </button>

        <button
          onClick={onClose}
          style={{
            padding: "12px",
            background: "rgba(30, 41, 59, 0.6)",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            borderRadius: "10px",
            color: "#94A3B8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#EF4444";
            e.currentTarget.style.color = "#EF4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.3)";
            e.currentTarget.style.color = "#94A3B8";
          }}
        >
          <X size={18} />
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
