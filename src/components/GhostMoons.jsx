// src/components/GhostMoons.jsx
import React from "react";
import { findLargestGaps } from "../lib/db";

const domainConfig = {
  private: { color: "#A78BFA", label: "Private" },
  public: { color: "#10B981", label: "Public" },
  abstract: { color: "#60A5FA", label: "Abstract" },
};

export default function GhostMoons({
  parentNode,
  existingReflections,
  onSelect,
  onCancel,
}) {
  // Calculate available slots
  const occupiedSlots = existingReflections.map((r) => r.slot);
  const availableSlots = findLargestGaps(occupiedSlots, 3);

  const domains = Object.keys(domainConfig);

  return (
    <div
      style={{
        display: "flex",
        gap: "32px",
        padding: "24px",
        background: "rgba(15, 23, 36, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(108, 99, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        animation: "scaleIn 0.3s ease",
      }}
    >
      {domains.map((domain, index) => {
        const config = domainConfig[domain];
        return (
          <button
            key={domain}
            onClick={() => onSelect(domain)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              const moon = e.currentTarget.querySelector(".ghost-moon");
              moon.style.transform = "scale(1.15)";
              moon.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              const moon = e.currentTarget.querySelector(".ghost-moon");
              moon.style.transform = "scale(1)";
              moon.style.opacity = "0.6";
            }}
          >
            {/* Ghost Moon */}
            <div
              className="ghost-moon"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: config.color,
                opacity: 0.6,
                boxShadow: `0 0 20px ${config.color}60`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 700,
                color: "#fff",
                border: `2px dashed ${config.color}`,
                transition: "all 0.3s ease",
                animation: "pulse 2s ease-in-out infinite",
                animationDelay: `${index * 0.2}s`,
              }}
            >
              R
            </div>

            {/* Label */}
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: config.color,
                textTransform: "capitalize",
              }}
            >
              {config.label}
            </div>
          </button>
        );
      })}

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 20px currentColor;
          }
          50% {
            box-shadow: 0 0 40px currentColor;
          }
        }
      `}</style>
    </div>
  );
}
