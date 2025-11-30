// src/components/AnalyticsPanel.jsx
import React from "react";
import { BarChart3, X } from "lucide-react";
import { domainColors } from "../seedData";

export default function AnalyticsPanel({ nodes, lenses, onClose }) {
  const contentNodes = nodes.filter((n) => n.type === "content");

  const domainCounts = {
    private: contentNodes.filter((n) => n.data.domainIds?.includes("private"))
      .length,
    public: contentNodes.filter((n) => n.data.domainIds?.includes("public"))
      .length,
    abstract: contentNodes.filter((n) => n.data.domainIds?.includes("abstract"))
      .length,
  };

  const lensCounts = lenses.map((lens) => ({
    ...lens,
    count: contentNodes.filter((n) => n.data.lensIds?.includes(lens.id)).length,
  }));

  // Count seeds with expanded domains (has content filled in)
  const expandedSeeds = contentNodes.filter(
    (n) =>
      n.data.domains?.private ||
      n.data.domains?.public ||
      n.data.domains?.abstract
  ).length;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "360px",
        background: "#0F1724",
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        color: "#E6EEF8",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <BarChart3 size={20} /> Analytics
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#94A3B8",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "12px" }}
          >
            Total Seeds
          </h3>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#6C63FF" }}>
            {contentNodes.length}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            {expandedSeeds} expanded • {contentNodes.length - expandedSeeds}{" "}
            minimal
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "12px" }}
          >
            By Domain
          </h3>
          {Object.entries(domainCounts).map(([domain, count]) => (
            <div
              key={domain}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                background: "#1E293B",
                borderRadius: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ textTransform: "capitalize" }}>{domain}</span>
              <span style={{ fontWeight: 600, color: domainColors[domain] }}>
                {count}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "12px" }}
          >
            By Lens
          </h3>
          {lensCounts.map((lens) => (
            <div
              key={lens.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                background: "#1E293B",
                borderRadius: "8px",
                marginBottom: "8px",
              }}
            >
              <span>{lens.name}</span>
              <span style={{ fontWeight: 600, color: lens.color }}>
                {lens.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
