// src/components/Moon.jsx - V2.2 Basic (RadialMenu integration is Phase 2)
import React from "react";
import { moonConfig } from "../seedData";

export default function Moon({
  node,
  position,
  count,
  isGhost = false,
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const dimension = node.dimension;
  const config = moonConfig.dimension[dimension];

  if (!config) {
    console.error(`Unknown dimension: ${dimension}`);
    return null;
  }

  const radius = config.radius;
  const x = position?.x || node.position?.x || 0;
  const y = position?.y || node.position?.y || 0;

  const opacity = isGhost ? 0.3 : 1;
  const strokeOpacity = isGhost ? 0.2 : 0.5;
  const glowOpacity = isHovered ? 0.6 : isGhost ? 0.1 : 0.3;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(node);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      <defs>
        <radialGradient id={`moon-gradient-${node.id}`}>
          <stop offset="0%" stopColor={config.color} stopOpacity="1" />
          <stop offset="100%" stopColor={config.color} stopOpacity="0.6" />
        </radialGradient>

        <filter
          id={`moon-glow-${node.id}`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation={isHovered ? "4" : "2"} result="blur" />
          <feFlood floodColor={config.color} floodOpacity="1" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Glow */}
      <circle
        cx={x}
        cy={y}
        r={radius * 1.5}
        fill={config.color}
        opacity={glowOpacity}
        filter={`url(#moon-glow-${node.id})`}
        style={{ transition: "all 0.3s ease" }}
      />

      {/* Main Moon Body */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={`url(#moon-gradient-${node.id})`}
        stroke={config.color}
        strokeWidth={isHovered ? 2 : 1}
        strokeOpacity={strokeOpacity}
        opacity={opacity}
        style={{ transition: "all 0.2s ease" }}
      />

      {/* Aggregate Count Badge */}
      {count && count > 1 && (
        <g>
          <circle
            cx={x + radius * 0.6}
            cy={y - radius * 0.6}
            r={8}
            fill="rgba(15, 23, 36, 0.95)"
            stroke={config.color}
            strokeWidth={1.5}
          />
          <text
            x={x + radius * 0.6}
            y={y - radius * 0.6}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight="bold"
            fill="#E6EEF8"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {count}
          </text>
        </g>
      )}

      {/* Ghost Label */}
      {isGhost && (
        <text
          x={x}
          y={y + radius + 16}
          textAnchor="middle"
          fontSize={11}
          fill={config.color}
          opacity={0.6}
          fontWeight={500}
          style={{ pointerEvents: "none", textTransform: "capitalize" }}
        >
          {config.name}
        </text>
      )}

      {/* Hover Ring */}
      {isHovered && !isGhost && (
        <circle
          cx={x}
          cy={y}
          r={radius + 4}
          fill="none"
          stroke={config.color}
          strokeWidth={2}
          strokeDasharray="3,3"
          opacity={0.8}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="12"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}
