// src/components/ReflectionSpace.jsx - V2.2 with Progressive Unlock & Archetype Recalc
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Planet from "./Planet";
import Moon from "./Moon";
import MoonInputCard from "./MoonInputCard";
import DimensionUnlockNotification from "./DimensionUnlockNotification";
import {
  getGhostMoonPositions,
  groupMoonsByDimension,
  getOrbitalPaths,
} from "../lib/orbitalPhysics";
import { moonConfig } from "../seedData";
import {
  db,
  getTotalReflectionCount,
  checkDimensionUnlock,
  getUnlockedDimensions,
} from "../lib/db";

export default function ReflectionSpace({
  parentNode,
  nodes,
  onSwitchToObservation,
  onNodesUpdate,
}) {
  const [hoveredDimension, setHoveredDimension] = useState(null);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [expandedDimension, setExpandedDimension] = useState(null);
  const [showInputCard, setShowInputCard] = useState(false);
  const [unlockNotification, setUnlockNotification] = useState(null);
  const [unlockedDimensions, setUnlockedDimensions] = useState([]);

  // Center planet in viewport
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = (window.innerHeight - 60) / 2 + 60;

  const centeredPlanet = {
    ...parentNode,
    position: {
      x: viewportCenterX - 50,
      y: viewportCenterY - 50,
    },
  };

  const childMoons = nodes.filter((n) => n.parentId === parentNode.id);
  const groupedMoons = groupMoonsByDimension(childMoons, centeredPlanet);
  const ghostPositions = getGhostMoonPositions(centeredPlanet);
  const orbitalPaths = getOrbitalPaths(centeredPlanet);

  // Load unlocked dimensions on mount
  useEffect(() => {
    async function loadUnlocked() {
      const unlocked = await getUnlockedDimensions();
      setUnlockedDimensions(unlocked);
    }
    loadUnlocked();
  }, []);

  // Filter ghost positions by unlocked dimensions
  const availableGhostPositions = Object.fromEntries(
    Object.entries(ghostPositions).filter(([dimension]) =>
      unlockedDimensions.includes(dimension),
    ),
  );

  const handleGhostClick = (dimension) => {
    setSelectedDimension(dimension);
    setShowInputCard(true);
  };

  const handleAggregateMoonClick = (dimension) => {
    if (expandedDimension === dimension) {
      setExpandedDimension(null);
    } else {
      setExpandedDimension(dimension);
    }
  };

  const handleSaveReflection = async (reflectionData) => {
    // Track count before adding (for unlock check)
    const previousCount = await getTotalReflectionCount();

    const newMoon = {
      type: "R",
      parentId: parentNode.id,
      dimension: selectedDimension,
      text: reflectionData.text,
      lensesUsed: reflectionData.lensesUsed || [],
      orbitAngle: 0,
      confidence: "stable",
      intensity: "medium",
      temporality: "concurrent",
      versions: [],
      relationships: [],
    };

    await db.nodes.add(newMoon);

    // Check if dimension unlocked
    const newCount = await getTotalReflectionCount();
    const unlocks = await checkDimensionUnlock(previousCount, newCount);
    if (unlocks.length > 0) {
      setUnlockNotification(unlocks[0]);
      const newUnlocked = await getUnlockedDimensions();
      setUnlockedDimensions(newUnlocked);
    }

    await onNodesUpdate();

    setShowInputCard(false);
    setSelectedDimension(null);
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

      {/* Main Content Area with Planet & Moons */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Instructions */}
        {!showInputCard && !expandedDimension && (
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

        {/* SVG Canvas with Planet, Orbital Paths, and Moons */}
        <svg
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
            {/* Orbital Path Circles */}
            {orbitalPaths
              .filter((path) => unlockedDimensions.includes(path.dimension))
              .map((path) => (
                <circle
                  key={path.dimension}
                  cx={path.centerX}
                  cy={path.centerY}
                  r={path.radius}
                  fill="none"
                  stroke={path.color}
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                  strokeDasharray="4,4"
                />
              ))}

            {/* Central Planet */}
            <Planet
              node={centeredPlanet}
              isHovered={false}
              isSelected={false}
              isFocused={true}
            />

            {/* Ghost Moons or Aggregate Moons */}
            {!showInputCard &&
              Object.entries(availableGhostPositions).map(
                ([dimension, position]) => {
                  const existingGroup = groupedMoons[dimension];
                  const hasExisting = existingGroup && existingGroup.count > 0;

                  if (hasExisting && !expandedDimension) {
                    const aggregateNode = {
                      id: `${parentNode.id}-${dimension}`,
                      type: "R",
                      dimension,
                      text: `${existingGroup.count} ${dimension} reflection${existingGroup.count > 1 ? "s" : ""}`,
                      position,
                    };

                    return (
                      <Moon
                        key={dimension}
                        node={aggregateNode}
                        position={position}
                        count={existingGroup.count}
                        isHovered={hoveredDimension === dimension}
                        onClick={() => handleAggregateMoonClick(dimension)}
                        onMouseEnter={() => setHoveredDimension(dimension)}
                        onMouseLeave={() => setHoveredDimension(null)}
                      />
                    );
                  }

                  if (
                    !hasExisting ||
                    (expandedDimension && expandedDimension !== dimension)
                  ) {
                    const ghostNode = {
                      id: `ghost-${dimension}`,
                      type: "R",
                      dimension,
                      text: dimension,
                    };

                    return (
                      <Moon
                        key={dimension}
                        node={ghostNode}
                        position={position}
                        isGhost={true}
                        isHovered={hoveredDimension === dimension}
                        onClick={() => handleGhostClick(dimension)}
                        onMouseEnter={() => setHoveredDimension(dimension)}
                        onMouseLeave={() => setHoveredDimension(null)}
                      />
                    );
                  }

                  return null;
                },
              )}
          </g>
        </svg>

        {/* Expanded Individual Moons Panel */}
        {expandedDimension && groupedMoons[expandedDimension] && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(30, 41, 59, 0.95)",
              border: `2px solid ${moonConfig.dimension[expandedDimension].color}`,
              borderRadius: "16px",
              padding: "24px",
              minWidth: "300px",
              maxWidth: "400px",
              maxHeight: "60vh",
              overflowY: "auto",
              boxShadow: "0 12px 48px rgba(0, 0, 0, 0.5)",
              zIndex: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: `1px solid ${moonConfig.dimension[expandedDimension].color}40`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: moonConfig.dimension[expandedDimension].color,
                  textTransform: "capitalize",
                }}
              >
                {moonConfig.dimension[expandedDimension].name} Reflections
              </h3>
              <button
                onClick={() => setExpandedDimension(null)}
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
              {groupedMoons[expandedDimension].moons.map((moon) => (
                <div
                  key={moon.id}
                  style={{
                    padding: "12px",
                    background: "rgba(15, 23, 36, 0.6)",
                    border: `1px solid ${moonConfig.dimension[expandedDimension].color}30`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${moonConfig.dimension[expandedDimension].color}20`;
                    e.currentTarget.style.borderColor =
                      moonConfig.dimension[expandedDimension].color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(15, 23, 36, 0.6)";
                    e.currentTarget.style.borderColor = `${moonConfig.dimension[expandedDimension].color}30`;
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
                            background: `${moonConfig.dimension[expandedDimension].color}30`,
                            borderRadius: "4px",
                            fontSize: "10px",
                            color:
                              moonConfig.dimension[expandedDimension].color,
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
                onClick={() => handleGhostClick(expandedDimension)}
                style={{
                  padding: "12px",
                  background: "transparent",
                  border: `2px dashed ${moonConfig.dimension[expandedDimension].color}40`,
                  borderRadius: "8px",
                  color: moonConfig.dimension[expandedDimension].color,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor =
                    moonConfig.dimension[expandedDimension].color;
                  e.target.style.background = `${moonConfig.dimension[expandedDimension].color}10`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = `${moonConfig.dimension[expandedDimension].color}40`;
                  e.target.style.background = "transparent";
                }}
              >
                + Add New Reflection
              </button>
            </div>
          </div>
        )}

        {/* Input Card */}
        {showInputCard && selectedDimension && (
          <MoonInputCard
            dimension={selectedDimension}
            onSave={handleSaveReflection}
            onCancel={() => {
              setShowInputCard(false);
              setSelectedDimension(null);
            }}
          />
        )}

        {/* Unlock Notification */}
        {unlockNotification && (
          <DimensionUnlockNotification
            dimension={unlockNotification.dimension}
            onDismiss={() => setUnlockNotification(null)}
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
