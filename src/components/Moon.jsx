// src/components/Moon.jsx
import React from "react";
import { MOON } from "../utils/constants";

export default function Moon({
  node,
  position,
  isHovered,
  isSelected,
  isGhost = false,
  isExpanded = false,
  count = 1,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const domain = MOON.domains[node?.domain || "private"];
  const radius = MOON.radius;

  // Use provided position or node's position
  const x = position?.x || node.position?.x || 0;
  const y = position?.y || node.position?.y || 0;

  const gradientId = `moon-gradient-${node?.id || Math.random()}`;
  const glowId = `moon-glow-${node?.id || Math.random()}`;

  // Ghost moon styling
  const opacity = isGhost
    ? isHovered
      ? MOON.ghost.hoverOpacity
      : MOON.ghost.opacity
    : 1;

  return (
    <g
      onClick={(e) => !isGhost && onClick?.(node, e)}
      onMouseEnter={() => onMouseEnter?.(node)}
      onMouseLeave={() => onMouseLeave?.()}
      style={{ cursor: isGhost ? "pointer" : "pointer" }}
      opacity={opacity}
      transform={isHovered && !isGhost ? "scale(1.15)" : "scale(1)"}
      transformOrigin={`${x} ${y}`}
    >
      <defs>
        {/* Moon Gradient */}
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={domain.color} stopOpacity="0.9" />
          <stop offset="70%" stopColor={domain.color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={domain.color} stopOpacity="0.5" />
        </radialGradient>

        {/* Glow Filter */}
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={isHovered ? "6" : "4"} result="blur" />
          <feFlood floodColor={domain.glow} floodOpacity="0.8" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Pulsing Halo */}
      {!isGhost && (
        <circle
          cx={x}
          cy={y}
          r={radius * 2}
          fill={domain.glow}
          opacity={isHovered ? 0.3 : 0.15}
        >
          <animate
            attributeName="r"
            values={`${radius * 1.8};${radius * 2.2};${radius * 1.8}`}
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values={`${isHovered ? 0.2 : 0.1};${isHovered ? 0.4 : 0.2};${
              isHovered ? 0.2 : 0.1
            }`}
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Main Moon Body */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={`url(#${gradientId})`}
        stroke={isSelected ? "#FFFFFF" : domain.color}
        strokeWidth={isSelected ? 2 : 1}
        strokeOpacity={isGhost ? 0.5 : 0.8}
        filter={!isGhost ? `url(#${glowId})` : "none"}
      />

      {/* Highlight Spot */}
      <circle
        cx={x - radius * 0.3}
        cy={y - radius * 0.3}
        r={radius * 0.4}
        fill="rgba(255, 255, 255, 0.4)"
        opacity={isGhost ? 0.2 : 0.6}
      />

      {/* Aggregate Count Badge */}
      {!isGhost && count > 1 && (
        <g>
          <circle
            cx={x + radius * 0.6}
            cy={y - radius * 0.6}
            r={MOON.aggregateIndicator.radius}
            fill={MOON.aggregateIndicator.color}
            stroke={domain.color}
            strokeWidth={2}
          />
          <text
            x={x + radius * 0.6}
            y={y - radius * 0.6}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={MOON.aggregateIndicator.fontSize}
            fontWeight={MOON.aggregateIndicator.fontWeight}
            fill={domain.color}
          >
            {count}
          </text>
        </g>
      )}

      {/* Ghost Moon Domain Label */}
      {isGhost && isHovered && (
        <text
          x={x}
          y={y + radius + 14}
          textAnchor="middle"
          fontSize={11}
          fill={domain.color}
          fontWeight={600}
          opacity={0.9}
        >
          {domain.name}
        </text>
      )}

      {/* Expanded Mini-Moon Connector Line */}
      {isExpanded && (
        <line
          x1={x}
          y1={y}
          x2={x}
          y2={y - 40}
          stroke={domain.color}
          strokeWidth={1}
          strokeOpacity={0.4}
          strokeDasharray="2,2"
        />
      )}

      {/* Selection Ring */}
      {isSelected && !isGhost && (
        <circle
          cx={x}
          cy={y}
          r={radius + 4}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={1.5}
          strokeDasharray="3,3"
          opacity={0.8}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${x} ${y}`}
            to={`360 ${x} ${y}`}
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Hover Text Preview (for non-ghost moons) */}
      {isHovered && !isGhost && node?.text && (
        <g>
          <rect
            x={x - 70}
            y={y + radius + 8}
            width={140}
            height={30}
            rx={5}
            fill="rgba(15, 23, 36, 0.95)"
            stroke={domain.color}
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <text
            x={x}
            y={y + radius + 23}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fill="#E6EEF8"
            fontWeight={400}
            style={{ pointerEvents: "none" }}
          >
            {node.text.length > 18 ? node.text.slice(0, 18) + "..." : node.text}
          </text>
        </g>
      )}
    </g>
  );
}
