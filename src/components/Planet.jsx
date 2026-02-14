// src/components/Planet.jsx - V3.0 Moon-Based Coloring
import React from "react";
import { planetConfig } from "../seedData";

// ============================================================================
// COLOR CALCULATION - Planet color based on dominant dimension
// ============================================================================

function calculatePlanetColor(moons) {
  if (!moons || moons.length === 0) {
    // No reflections = gray planet
    return {
      core: ["#475569", "#64748B"],
      surface: ["#64748B", "#94A3B8"],
      atmosphere: ["#94A3B8", "#CBD5E1"],
      glow: "rgba(148, 163, 184, 0.3)",
    };
  }

  // Count moons per dimension
  const counts = {
    subjective: 0,
    behavioral: 0,
    intersubjective: 0,
    symbolic: 0,
  };

  moons.forEach((moon) => {
    if (counts[moon.dimension] !== undefined) {
      counts[moon.dimension]++;
    }
  });

  // Find dominant dimension (most moons)
  let dominant = "subjective";
  let maxCount = 0;
  Object.entries(counts).forEach(([dim, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominant = dim;
    }
  });

  // Return color scheme based on dominant dimension
  const dimensionColors = {
    subjective: {
      // Violet - Inner Experience
      core: ["#7C3AED", "#8B5CF6"],
      surface: ["#A78BFA", "#C4B5FD"],
      atmosphere: ["#DDD6FE", "#EDE9FE"],
      glow: "rgba(167, 139, 250, 0.4)",
    },
    behavioral: {
      // Orange - Actions
      core: ["#EA580C", "#F97316"],
      surface: ["#FB923C", "#FDBA74"],
      atmosphere: ["#FED7AA", "#FFEDD5"],
      glow: "rgba(249, 115, 22, 0.4)",
    },
    intersubjective: {
      // Green - External/Measurable
      core: ["#059669", "#10B981"],
      surface: ["#34D399", "#6EE7B7"],
      atmosphere: ["#A7F3D0", "#D1FAE5"],
      glow: "rgba(16, 185, 129, 0.4)",
    },
    symbolic: {
      // Blue - Patterns/Meaning
      core: ["#2563EB", "#3B82F6"],
      surface: ["#60A5FA", "#93C5FD"],
      atmosphere: ["#DBEAFE", "#EFF6FF"],
      glow: "rgba(59, 130, 246, 0.4)",
    },
  };

  return dimensionColors[dominant];
}

function calculateSurfaceState(moons) {
  if (!moons || moons.length === 0) {
    return "calm";
  }

  // Count tension relationships across all moons
  const tensionCount = moons.reduce(
    (sum, moon) =>
      sum +
      (moon.relationships?.filter((r) => r.type === "tension").length || 0),
    0,
  );

  if (tensionCount === 0) return "calm";
  if (tensionCount <= 2) return "rippled";
  return "stormy";
}

// ============================================================================
// PLANET COMPONENT
// ============================================================================

export default function Planet({
  node,
  moons = [], // NEW: Accept moons prop
  isHovered,
  isSelected,
  isFocused,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
}) {
  // Calculate colors from moons
  const colors = calculatePlanetColor(moons);
  const surfaceState = calculateSurfaceState(moons);

  const { x, y } = node.position;
  const radius = planetConfig.baseRadius;
  const centerX = x + radius;
  const centerY = y + radius;

  const gradientId = `gradient-${node.id}`;
  const glowId = `glow-${node.id}`;
  const noiseId = `noise-${node.id}`;

  const stateConfig =
    node.state && node.type === "A" ? planetConfig.states[node.state] : null;

  const opacity = stateConfig?.opacity || 1;
  const glowOpacity = isHovered ? 0.5 : 0.2;
  const glowRadius = isHovered
    ? planetConfig.glowRadius * 1.2
    : planetConfig.glowRadius;

  return (
    <g
      onClick={(e) => onClick?.(node, e)}
      onDoubleClick={(e) => onDoubleClick?.(node, e)}
      onMouseEnter={() => onMouseEnter?.(node)}
      onMouseLeave={() => onMouseLeave?.()}
      onMouseDown={(e) => onMouseDown?.(node, e)}
      style={{ cursor: "pointer" }}
      opacity={isFocused === false ? 0.3 : opacity}
    >
      <defs>
        {/* Core to Surface Gradient */}
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={colors.core[0]} />
          <stop offset="40%" stopColor={colors.core[1]} />
          <stop offset="70%" stopColor={colors.surface[0]} />
          <stop offset="100%" stopColor={colors.surface[1]} />
        </radialGradient>

        {/* Surface Texture Pattern */}
        <filter id={noiseId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves={2}
            result="noise"
          />
          <feDiffuseLighting
            in="noise"
            lightingColor={colors.surface[1]}
            surfaceScale="2"
          >
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
          <feComposite operator="in" in2="SourceGraphic" />
          <feBlend in2="SourceGraphic" mode="overlay" />
        </filter>

        {/* Glow Filter */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isHovered ? "8" : "5"} result="blur" />
          <feFlood floodColor={colors.glow} floodOpacity="1" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Glow Aura */}
      <circle
        cx={centerX}
        cy={centerY}
        r={glowRadius}
        fill={colors.glow}
        opacity={glowOpacity}
        filter={`url(#${glowId})`}
        style={{ transition: "all 0.3s ease" }}
      />

      {/* State-Specific Overlays for Action Nodes */}
      {node.type === "A" && stateConfig && (
        <>
          {node.state === "past" && (
            <ellipse
              cx={centerX - 30}
              cy={centerY}
              rx={stateConfig.trailLength}
              ry={radius * 0.5}
              fill={stateConfig.trailColor}
              opacity={0.4}
            />
          )}

          {node.state === "present" && (
            <circle
              cx={centerX}
              cy={centerY}
              r={radius + 8}
              fill="none"
              stroke={stateConfig.pulseColor}
              strokeWidth={3}
              opacity={0.7}
            >
              <animate
                attributeName="r"
                values={`${radius + 5};${radius + 12};${radius + 5}`}
                dur={`${stateConfig.pulseSpeed}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;0.3;0.7"
                dur={`${stateConfig.pulseSpeed}s`}
                repeatCount="indefinite"
              />
            </circle>
          )}

          {node.state === "future" && (
            <circle
              cx={centerX}
              cy={centerY}
              r={glowRadius * stateConfig.glowIntensity}
              fill={stateConfig.glowColor}
              opacity={0.25}
            >
              <animate
                attributeName="opacity"
                values="0.15;0.35;0.15"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </>
      )}

      {/* Main Planet Body */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill={`url(#${gradientId})`}
        stroke={isSelected ? "#FFFFFF" : "rgba(255,255,255,0.1)"}
        strokeWidth={isSelected ? 3 : 1}
        filter={`url(#${noiseId})`}
      />

      {/* Atmosphere Layer */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill={colors.atmosphere[0]}
        opacity={0.15}
      />

      {/* Highlight (Top-Left Shine) */}
      <ellipse
        cx={centerX + planetConfig.highlightOffset.x * radius}
        cy={centerY + planetConfig.highlightOffset.y * radius}
        rx={radius * 0.35}
        ry={radius * 0.25}
        fill="rgba(255, 255, 255, 0.5)"
        opacity={0.7}
      />

      {/* Secondary Shine (Softer) */}
      <ellipse
        cx={centerX + planetConfig.highlightOffset.x * radius * 0.5}
        cy={centerY + planetConfig.highlightOffset.y * radius * 0.5}
        rx={radius * 0.2}
        ry={radius * 0.15}
        fill="rgba(255, 255, 255, 0.3)"
        opacity={0.5}
      />

      {/* Surface Animation - Tension-based */}
      {surfaceState === "rippled" && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 3}
          fill="none"
          stroke={colors.surface[1]}
          strokeWidth={1}
          opacity={0.4}
        >
          <animate
            attributeName="r"
            values={`${radius + 2};${radius + 5};${radius + 2}`}
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.5;0.2"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {surfaceState === "stormy" && (
        <>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 3}
            fill="none"
            stroke="#EF4444"
            strokeWidth={2}
            opacity={0.6}
          >
            <animate
              attributeName="r"
              values={`${radius + 2};${radius + 8};${radius + 2}`}
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.7;0.3"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 6}
            fill="none"
            stroke="#F97316"
            strokeWidth={1}
            opacity={0.4}
          >
            <animate
              attributeName="r"
              values={`${radius + 4};${radius + 10};${radius + 4}`}
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2;0.5;0.2"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {/* Moon Count Badge (Bottom Right) */}
      {moons && moons.length > 0 && (
        <g>
          <circle
            cx={centerX + radius * 0.7}
            cy={centerY + radius * 0.7}
            r={12}
            fill="rgba(15, 23, 36, 0.95)"
            stroke={colors.glow}
            strokeWidth={2}
          />
          <text
            x={centerX + radius * 0.7}
            y={centerY + radius * 0.7}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fill="#E6EEF8"
            fontWeight="600"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {moons.length}
          </text>
        </g>
      )}

      {/* Title Label Below Planet */}
      <text
        x={centerX}
        y={centerY + radius + 20}
        textAnchor="middle"
        fontSize={13}
        fill="#E6EEF8"
        fontWeight={500}
        opacity={0.9}
        style={{ pointerEvents: "none" }}
      >
        {node.text?.substring(0, 20) || "Untitled"}
        {node.text?.length > 20 ? "..." : ""}
      </text>

      {/* Selection Ring Animation */}
      {isSelected && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 6}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeDasharray="4,4"
          opacity={0.8}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${centerX} ${centerY}`}
            to={`360 ${centerX} ${centerY}`}
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Hover Tooltip */}
      {isHovered && node.text && (
        <g>
          <rect
            x={centerX - 100}
            y={centerY - radius - 50}
            width={200}
            height={40}
            rx={6}
            fill="rgba(15, 23, 36, 0.95)"
            stroke="rgba(108, 99, 255, 0.5)"
            strokeWidth={1}
          />
          <text
            x={centerX}
            y={centerY - radius - 30}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="#E6EEF8"
            fontWeight={500}
            style={{ pointerEvents: "none" }}
          >
            {node.text.substring(0, 30)}
            {node.text.length > 30 ? "..." : ""}
          </text>
        </g>
      )}
    </g>
  );
}
