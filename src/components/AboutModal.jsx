// src/components/AboutModal.jsx
import React from "react";
import { X, Eye, Layers, Sparkles } from "lucide-react";

export default function AboutModal({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 4000,
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        style={{
          width: "600px",
          maxWidth: "90vw",
          maxHeight: "85vh",
          background: "linear-gradient(135deg, #0F1724 0%, #1A1F35 100%)",
          borderRadius: "20px",
          border: "1px solid rgba(108, 99, 255, 0.3)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
          display: "flex",
          flexDirection: "column",
          color: "#E6EEF8",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              "linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(77, 159, 255, 0.05) 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Sparkles size={24} color="#6C63FF" />
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
              What is Chroma?
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              fontSize: "28px",
              cursor: "pointer",
              padding: "0 8px",
              lineHeight: "1",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px",
          }}
        >
          {/* Hero Statement */}
          <div
            style={{
              marginBottom: "32px",
              padding: "20px",
              background:
                "linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(167, 139, 250, 0.05) 100%)",
              borderRadius: "12px",
              border: "1px solid rgba(108, 99, 255, 0.2)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#CBD5E1",
                fontWeight: 500,
              }}
            >
              A tool for understanding yourself through visual mapping—revealing
              patterns, connections, and layers in how you perceive and convey
              your world.
            </p>
          </div>

          {/* Three Cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                padding: "18px",
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "10px",
                border: "1px solid rgba(79, 159, 255, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <Eye size={20} color="#4D9FFF" />
                <h3
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#4D9FFF",
                  }}
                >
                  Provisional Mapping
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: "#94A3B8",
                }}
              >
                This isn't about finding fixed truths. It's a space to explore
                how you currently see things, knowing that reflection is ongoing
                and your map will evolve.
              </p>
            </div>

            <div
              style={{
                padding: "18px",
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "10px",
                border: "1px solid rgba(167, 139, 250, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <Layers size={20} color="#A78BFA" />
                <h3
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#A78BFA",
                  }}
                >
                  Go Slow, Go Deep
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: "#94A3B8",
                }}
              >
                Rushing to capture "what" you are neutralizes the process. Tap
                into each layer. Feel what's really there. The value is in the
                attention, not the speed.
              </p>
            </div>

            <div
              style={{
                padding: "18px",
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "10px",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <Sparkles size={20} color="#10B981" />
                <h3
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#10B981",
                  }}
                >
                  Expand Your Lens
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: "#94A3B8",
                }}
              >
                Use this to question your observations, strengthen your
                perspectives, or articulate what you feel more clearly. It's an
                educational tool as much as a reflective one.
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <div
            style={{
              padding: "16px",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: "1.5",
                color: "#FCA5A5",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              This tool can be extremely useful or completely useless—it depends
              entirely on how you use it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
