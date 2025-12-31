// src/components/Planet.jsx
import React from "react";
import { PLANET } from "../utils/constants";

export default function Planet({
  node,
  isHovered,
  isSelected,
  isFocused,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const config = PLANET[node.type];
  const { x, y } = node.position;
  const radius = config.radius;
  const centerX = x + radius;
  const centerY = y + radius;

  // Unique IDs for gradients (to avoid conflicts)
  const gradientId = `gradient-${node.id}`;
  const glowId = `glow-${node.id}`;

  // State-specific styling for Action nodes
  const stateStyle =
    node.type === "A" && node.state ? config.states[node.state] : null;

  return (
    <g
      onClick={(e) => onClick?.(node, e)}
      onDoubleClick={(e) => onDoubleClick?.(node, e)}
      onMouseEnter={() => onMouseEnter?.(node)}
      onMouseLeave={() => onMouseLeave?.()}
      style={{ cursor: "pointer" }}
      opacity={isFocused === false ? 0.3 : 1}
      transform={isHovered ? "scale(1.05)" : "scale(1)"}
      transformOrigin={`${centerX} ${centerY}`}
      transition="all 0.2s ease"
    >
      <defs>
        {/* Core to Surface Gradient */}
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={config.colors.core[0]} />
          <stop offset="40%" stopColor={config.colors.core[1]} />
          <stop offset="70%" stopColor={config.colors.surface[0]} />
          <stop offset="100%" stopColor={config.colors.surface[1]} />
        </radialGradient>

        {/* Glow Filter */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isHovered ? "8" : "5"} result="blur" />
          <feFlood floodColor={config.colors.glow} floodOpacity="1" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Glow */}
      <circle
        cx={centerX}
        cy={centerY}
        r={config.glowRadius}
        fill={config.colors.glow}
        opacity={isHovered ? 0.3 : 0.2}
        filter={`url(#${glowId})`}
      />

      {/* Main Planet Body */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill={`url(#${gradientId})`}
        stroke={isSelected ? "#FFFFFF" : "rgba(255,255,255,0.1)"}
        strokeWidth={isSelected ? 3 : 1}
      />

      {/* Highlight (Top-Left Shine) */}
      <ellipse
        cx={centerX + config.highlightOffset.x * radius}
        cy={centerY + config.highlightOffset.y * radius}
        rx={radius * 0.35}
        ry={radius * 0.25}
        fill="rgba(255, 255, 255, 0.3)"
        opacity={0.6}
      />

      {/* State-Specific Overlays for Action Nodes */}
      {node.type === "A" && stateStyle && (
        <>
          {/* Past: Trailing Glow */}
          {node.state === "past" && (
            <ellipse
              cx={centerX - 30}
              cy={centerY}
              rx={stateStyle.trailLength}
              ry={radius * 0.5}
              fill={stateStyle.trailColor}
              opacity={0.4}
            />
          )}

          {/* Present: Pulsing Ring */}
          {node.state === "present" && (
            <circle
              cx={centerX}
              cy={centerY}
              r={radius + 8}
              fill="none"
              stroke={stateStyle.pulseColor}
              strokeWidth={3}
              opacity={0.7}
            >
              <animate
                attributeName="r"
                values={`${radius + 5};${radius + 12};${radius + 5}`}
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;0.3;0.7"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* Future: Enhanced Glow */}
          {node.state === "future" && (
            <circle
              cx={centerX}
              cy={centerY}
              r={config.glowRadius * 1.2}
              fill={stateStyle.glowColor}
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

      {/* Icon Overlay */}
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={config.iconSize}
        opacity={0.9}
      >
        {config.icon}
      </text>

      {/* Node Text (appears on hover) */}
      {isHovered && (
        <g>
          <rect
            x={centerX - 80}
            y={centerY + radius + 10}
            width={160}
            height={36}
            rx={6}
            fill="rgba(15, 23, 36, 0.95)"
            stroke="rgba(108, 99, 255, 0.5)"
            strokeWidth={1}
          />
          <text
            x={centerX}
            y={centerY + radius + 28}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="#E6EEF8"
            fontWeight={500}
            style={{ pointerEvents: "none" }}
          >
            {node.text.length > 20 ? node.text.slice(0, 20) + "..." : node.text}
          </text>
        </g>
      )}

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
    </g>
  );
}
