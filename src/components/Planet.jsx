// src/components/Planet.jsx - Updated with Variants & Fixes
import React from "react";
import { planetVariants, planetConfig } from "../seedData";

export default function Planet({
  node,
  isHovered,
  isSelected,
  isFocused,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
}) {
  const variantType = node.type === "O" ? "observation" : "action";
  const defaultVariant = variantType === "observation" ? "deep-ocean" : "ember";
  const variantKey = node.variant || defaultVariant;
  const variant =
    planetVariants[variantType]?.[variantKey] ||
    planetVariants[variantType][defaultVariant];

  const { x, y } = node.position;
  const radius = planetConfig.baseRadius;
  const centerX = x + radius;
  const centerY = y + radius;

  const gradientId = `gradient-${node.id}`;
  const glowId = `glow-${node.id}`;

  // State-specific styling
  const stateConfig =
    node.state && node.type === "A" ? planetConfig.states[node.state] : null;

  // Calculate opacity based on state
  const opacity = stateConfig?.opacity || 1;

  // Glow intensity based on hover
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
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={variant.colors.core[0]} />
          <stop offset="40%" stopColor={variant.colors.core[1]} />
          <stop offset="70%" stopColor={variant.colors.surface[0]} />
          <stop offset="100%" stopColor={variant.colors.surface[1]} />
        </radialGradient>

        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isHovered ? "8" : "5"} result="blur" />
          <feFlood floodColor={variant.colors.glow} floodOpacity="1" />
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
        fill={variant.colors.glow}
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
      />

      {/* Highlight (Top-Left Shine) */}
      <ellipse
        cx={centerX + planetConfig.highlightOffset.x * radius}
        cy={centerY + planetConfig.highlightOffset.y * radius}
        rx={radius * 0.35}
        ry={radius * 0.25}
        fill="rgba(255, 255, 255, 0.3)"
        opacity={0.6}
      />

      {/* Icon Overlay */}
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={planetConfig.iconSize}
        opacity={0.9}
        style={{ pointerEvents: "none" }}
      >
        {planetConfig.icon[node.type === "O" ? "observation" : "action"]}
      </text>

      {/* Title Label Below Planet (Always Visible) */}
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
