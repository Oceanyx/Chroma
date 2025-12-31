// src/components/ReflectionMode.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Moon from "./Moon";
import MoonInputCard from "./MoonInputCard";
import {
  getGhostMoonPositions,
  groupMoonsByDomain,
} from "../lib/orbitalPhysics";
import { MOON, REFLECTION_MODE } from "../utils/constants";
import { db } from "../lib/db";

export default function ReflectionMode({
  parentNode,
  nodes,
  onExit,
  onNodesUpdate,
}) {
  const [hoveredDomain, setHoveredDomain] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [showInputCard, setShowInputCard] = useState(false);

  // Get existing moons for this parent
  const childMoons = nodes.filter((n) => n.parentId === parentNode.id);
  const groupedMoons = groupMoonsByDomain(childMoons, parentNode);

  // Ghost moon positions
  const ghostPositions = getGhostMoonPositions(parentNode);

  // Handle ghost moon selection
  const handleGhostClick = (domain) => {
    setSelectedDomain(domain);
    setShowInputCard(true);
  };

  // Handle aggregate moon click (expand to show individual moons)
  const handleAggregateMoonClick = (domain) => {
    if (expandedDomain === domain) {
      setExpandedDomain(null);
    } else {
      setExpandedDomain(domain);
    }
  };

  // Save new reflection
  const handleSaveReflection = async (reflectionData) => {
    const newMoon = {
      type: "R",
      parentId: parentNode.id,
      domain: selectedDomain,
      text: reflectionData.text,
      lensesUsed: reflectionData.lensesUsed || [],
      orbitAngle: 0, // Will be calculated when rendered
    };

    await db.nodes.add(newMoon);
    await onNodesUpdate();

    setShowInputCard(false);
    setSelectedDomain(null);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showInputCard) {
          setShowInputCard(false);
          setSelectedDomain(null);
        } else {
          onExit();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showInputCard, onExit]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 36, 0.7)",
        backdropFilter: `blur(${REFLECTION_MODE.blurAmount}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Exit Button */}
      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: "80px",
          right: "30px",
          width: "44px",
          height: "44px",
          background: "rgba(30, 41, 59, 0.9)",
          border: "1px solid rgba(239, 68, 68, 0.5)",
          borderRadius: "50%",
          color: "#EF4444",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.background = "rgba(239, 68, 68, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.background = "rgba(30, 41, 59, 0.9)";
        }}
      >
        <X size={24} />
      </button>

      {/* Instructions */}
      {!showInputCard && !expandedDomain && (
        <div
          style={{
            position: "absolute",
            top: "80px",
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
          }}
        >
          Click a colored moon to add a reflection in that domain
        </div>
      )}

      {/* Ghost Moons (if not creating new reflection) */}
      {!showInputCard &&
        Object.entries(ghostPositions).map(([domain, position]) => {
          const existingGroup = groupedMoons[domain];
          const hasExisting = existingGroup && existingGroup.count > 0;

          if (hasExisting && !expandedDomain) {
            // Show aggregate moon
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

          // Show ghost moon for selection
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
            border: `2px solid ${MOON.domains[expandedDomain].color}`,
            borderRadius: "16px",
            padding: "24px",
            minWidth: "300px",
            maxWidth: "400px",
            maxHeight: "60vh",
            overflowY: "auto",
            boxShadow: "0 12px 48px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: `1px solid ${MOON.domains[expandedDomain].color}40`,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
                color: MOON.domains[expandedDomain].color,
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

          {/* Individual Moons List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {groupedMoons[expandedDomain].moons.map((moon, index) => (
              <div
                key={moon.id}
                style={{
                  padding: "12px",
                  background: "rgba(15, 23, 36, 0.6)",
                  border: `1px solid ${MOON.domains[expandedDomain].color}30`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${MOON.domains[expandedDomain].color}20`;
                  e.currentTarget.style.borderColor =
                    MOON.domains[expandedDomain].color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15, 23, 36, 0.6)";
                  e.currentTarget.style.borderColor = `${MOON.domains[expandedDomain].color}30`;
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
                          background: `${MOON.domains[expandedDomain].color}30`,
                          borderRadius: "4px",
                          fontSize: "10px",
                          color: MOON.domains[expandedDomain].color,
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

            {/* Add New Button */}
            <button
              onClick={() => handleGhostClick(expandedDomain)}
              style={{
                padding: "12px",
                background: "transparent",
                border: `2px dashed ${MOON.domains[expandedDomain].color}40`,
                borderRadius: "8px",
                color: MOON.domains[expandedDomain].color,
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = MOON.domains[expandedDomain].color;
                e.target.style.background = `${MOON.domains[expandedDomain].color}10`;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = `${MOON.domains[expandedDomain].color}40`;
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
  );
}
