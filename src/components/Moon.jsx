// src/components/Moon.jsx - Updated (No Glow, Stable)
import React from "react";
import { moonConfig } from "../seedData";

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
  const domain = moonConfig.domain[node?.domain || "private"];
  const radius = moonConfig.baseRadius;

  // Use provided position (already calculated)
  const x = position?.x || node.position?.x || 0;
  const y = position?.y || node.position?.y || 0;

  const gradientId = `moon-gradient-${node?.id || Math.random()}`;

  // Ghost moon styling
  const opacity = isGhost ? (isHovered ? 0.7 : 0.3) : 1;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(node, e);
      }}
      onMouseEnter={() => onMouseEnter?.(node)}
      onMouseLeave={() => onMouseLeave?.()}
      style={{ cursor: "pointer" }}
      opacity={opacity}
    >
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={domain.color} stopOpacity="0.9" />
          <stop offset="70%" stopColor={domain.color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={domain.color} stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* Main Moon Body */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={`url(#${gradientId})`}
        stroke={isSelected ? "#FFFFFF" : domain.color}
        strokeWidth={isSelected ? 2 : 1}
        strokeOpacity={isGhost ? 0.5 : 0.8}
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
            r={8}
            fill="#FFFFFF"
            stroke={domain.color}
            strokeWidth={2}
          />
          <text
            x={x + radius * 0.6}
            y={y - radius * 0.6}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight="bold"
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

      {/* Hover Text Preview */}
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
