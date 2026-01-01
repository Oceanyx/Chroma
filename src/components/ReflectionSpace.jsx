// src/components/ReflectionSpace.jsx - Updated for New Moon System
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Moon from "./Moon";
import MoonInputCard from "./MoonInputCard";
import {
  getGhostMoonPositions,
  groupMoonsByDomain,
} from "../lib/orbitalPhysics";
import { moonConfig } from "../seedData";
import { db } from "../lib/db";

export default function ReflectionSpace({
  parentNode,
  nodes,
  onSwitchToObservation,
  onNodesUpdate,
}) {
  const [hoveredDomain, setHoveredDomain] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [showInputCard, setShowInputCard] = useState(false);

  const childMoons = nodes.filter((n) => n.parentId === parentNode.id);
  const groupedMoons = groupMoonsByDomain(childMoons, parentNode);
  const ghostPositions = getGhostMoonPositions(parentNode);

  const handleGhostClick = (domain) => {
    setSelectedDomain(domain);
    setShowInputCard(true);
  };

  const handleAggregateMoonClick = (domain) => {
    if (expandedDomain === domain) {
      setExpandedDomain(null);
    } else {
      setExpandedDomain(domain);
    }
  };

  const handleSaveReflection = async (reflectionData) => {
    const newMoon = {
      type: "R",
      parentId: parentNode.id,
      domain: selectedDomain,
      text: reflectionData.text,
      lensesUsed: reflectionData.lensesUsed || [],
      orbitAngle: 0,
    };

    await db.nodes.add(newMoon);
    await onNodesUpdate();

    setShowInputCard(false);
    setSelectedDomain(null);
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
        flexDirection: "column",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          padding: "20px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(30, 41, 59, 0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(108, 99, 255, 0.2)",
        }}
      >
        <button
          onClick={onSwitchToObservation}
          style={{
            padding: "10px 16px",
            background: "rgba(108, 99, 255, 0.2)",
            border: "1px solid rgba(108, 99, 255, 0.4)",
            borderRadius: "8px",
            color: "#6C63FF",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#6C63FF";
            e.target.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(108, 99, 255, 0.2)";
            e.target.style.color = "#6C63FF";
          }}
        >
          <ArrowLeft size={16} /> Edit Observation
        </button>
        <div style={{ fontSize: "18px", fontWeight: 600, color: "#E6EEF8" }}>
          {parentNode.text?.substring(0, 40) || "Untitled"}
          {parentNode.text?.length > 40 ? "..." : ""}
        </div>
        <div style={{ width: "140px" }} />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* Instructions */}
        {!showInputCard && !expandedDomain && (
          <div
            style={{
              position: "absolute",
              top: "30px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "12px 20px",
              background: "rgba(30, 41, 59, 0.95)",
              border: "1px solid rgba(108, 99, 255, 0.3)",
              borderRadius: "10px",
              color: "#E6EEF8",
              fontSize: "13px",
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              zIndex: 10,
            }}
          >
            Click a colored moon to add or view reflections
          </div>
        )}

        {/* Ghost Moons / Aggregate Moons */}
        {!showInputCard &&
          Object.entries(ghostPositions).map(([domain, position]) => {
            const existingGroup = groupedMoons[domain];
            const hasExisting = existingGroup && existingGroup.count > 0;

            if (hasExisting && !expandedDomain) {
              const aggregateNode = {
                id: `${parentNode.id}-${domain}`,
                type: "R",
                domain,
                text: `${existingGroup.count} ${domain} reflection${
                  existingGroup.count > 1 ? "s" : ""
                }`,
                position,
              };

              return (
                <svg
                  key={domain}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  <g style={{ pointerEvents: "auto" }}>
                    <Moon
                      node={aggregateNode}
                      position={position}
                      count={existingGroup.count}
                      isHovered={hoveredDomain === domain}
                      onClick={() => handleAggregateMoonClick(domain)}
                      onMouseEnter={() => setHoveredDomain(domain)}
                      onMouseLeave={() => setHoveredDomain(null)}
                    />
                  </g>
                </svg>
              );
            }

            if (!hasExisting || (expandedDomain && expandedDomain !== domain)) {
              const ghostNode = {
                id: `ghost-${domain}`,
                type: "R",
                domain,
                text: domain,
              };

              return (
                <svg
                  key={domain}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  <g style={{ pointerEvents: "auto" }}>
                    <Moon
                      node={ghostNode}
                      position={position}
                      isGhost={true}
                      isHovered={hoveredDomain === domain}
                      onClick={() => handleGhostClick(domain)}
                      onMouseEnter={() => setHoveredDomain(domain)}
                      onMouseLeave={() => setHoveredDomain(null)}
                    />
                  </g>
                </svg>
              );
            }

            return null;
          })}

        {/* Expanded Individual Moons */}
        {expandedDomain && groupedMoons[expandedDomain] && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(30, 41, 59, 0.95)",
              border: `2px solid ${moonConfig.domain[expandedDomain].color}`,
              borderRadius: "16px",
              padding: "24px",
              minWidth: "300px",
              maxWidth: "400px",
              maxHeight: "60vh",
              overflowY: "auto",
              boxShadow: "0 12px 48px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: `1px solid ${moonConfig.domain[expandedDomain].color}40`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: moonConfig.domain[expandedDomain].color,
                  textTransform: "capitalize",
                }}
              >
                {expandedDomain} Reflections
              </h3>
              <button
                onClick={() => setExpandedDomain(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  fontSize: "20px",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {groupedMoons[expandedDomain].moons.map((moon) => (
                <div
                  key={moon.id}
                  style={{
                    padding: "12px",
                    background: "rgba(15, 23, 36, 0.6)",
                    border: `1px solid ${moonConfig.domain[expandedDomain].color}30`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${moonConfig.domain[expandedDomain].color}20`;
                    e.currentTarget.style.borderColor =
                      moonConfig.domain[expandedDomain].color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(15, 23, 36, 0.6)";
                    e.currentTarget.style.borderColor = `${moonConfig.domain[expandedDomain].color}30`;
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#E6EEF8",
                      lineHeight: "1.5",
                    }}
                  >
                    {moon.text}
                  </div>
                  {moon.lensesUsed && moon.lensesUsed.length > 0 && (
                    <div
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        gap: "4px",
                        flexWrap: "wrap",
                      }}
                    >
                      {moon.lensesUsed.map((lens) => (
                        <span
                          key={lens}
                          style={{
                            padding: "2px 6px",
                            background: `${moonConfig.domain[expandedDomain].color}30`,
                            borderRadius: "4px",
                            fontSize: "10px",
                            color: moonConfig.domain[expandedDomain].color,
                            textTransform: "capitalize",
                          }}
                        >
                          {lens}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => handleGhostClick(expandedDomain)}
                style={{
                  padding: "12px",
                  background: "transparent",
                  border: `2px dashed ${moonConfig.domain[expandedDomain].color}40`,
                  borderRadius: "8px",
                  color: moonConfig.domain[expandedDomain].color,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor =
                    moonConfig.domain[expandedDomain].color;
                  e.target.style.background = `${moonConfig.domain[expandedDomain].color}10`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = `${moonConfig.domain[expandedDomain].color}40`;
                  e.target.style.background = "transparent";
                }}
              >
                + Add New Reflection
              </button>
            </div>
          </div>
        )}

        {/* Input Card */}
        {showInputCard && selectedDomain && (
          <MoonInputCard
            domain={selectedDomain}
            onSave={handleSaveReflection}
            onCancel={() => {
              setShowInputCard(false);
              setSelectedDomain(null);
            }}
          />
        )}
      </div>

      {/* Bottom Preview Bar */}
      <div
        style={{
          padding: "16px 30px",
          background: "rgba(30, 41, 59, 0.9)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(108, 99, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Observation:
        </div>
        <div
          style={{ fontSize: "14px", color: "#E6EEF8", fontStyle: "italic" }}
        >
          {parentNode.text?.substring(0, 80) || "No description"}
          {parentNode.text?.length > 80 ? "..." : ""}
        </div>
      </div>
    </div>
  );
}
