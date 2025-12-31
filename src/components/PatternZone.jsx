// src/components/PatternZone.jsx
import React, { useMemo } from "react";
import { PATTERN_ZONE, PLANET, MOON } from "../utils/constants";

export default function PatternZone({ pattern, nodes, isHovered, onClick }) {
  // Calculate bounding box for pattern nodes
  const bounds = useMemo(() => {
    if (!pattern.nodeIds || pattern.nodeIds.length === 0) {
      return null;
    }

    const patternNodes = nodes.filter((n) => pattern.nodeIds.includes(n.id));

    if (patternNodes.length === 0) return null;

    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    patternNodes.forEach((node) => {
      let centerX, centerY, radius;

      if (node.type === "O" || node.type === "A") {
        radius = PLANET[node.type].radius;
        centerX = node.position.x + radius;
        centerY = node.position.y + radius;
      } else if (node.type === "R") {
        radius = MOON.radius;
        centerX = node.position.x;
        centerY = node.position.y;
      } else {
        return;
      }

      minX = Math.min(minX, centerX - radius);
      minY = Math.min(minY, centerY - radius);
      maxX = Math.max(maxX, centerX + radius);
      maxY = Math.max(maxY, centerY + radius);
    });

    // Add padding
    const padding = PATTERN_ZONE.blobPadding;
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [pattern.nodeIds, nodes]);

  if (!bounds) return null;

  const isCustom = pattern.type === "custom";
  const fillColor = isCustom
    ? PATTERN_ZONE.colors.custom
    : PATTERN_ZONE.colors.auto;
  const strokeColor = isCustom
    ? PATTERN_ZONE.colors.customStroke
    : PATTERN_ZONE.colors.autoStroke;

  // Create organic blob path using rounded rectangle with curves
  const createBlobPath = (bounds) => {
    const { x, y, width, height } = bounds;
    const radius = PATTERN_ZONE.borderRadius;

    // Add some organic variation
    const variation = 8;
    const v1 = Math.sin(x * 0.1) * variation;
    const v2 = Math.cos(y * 0.1) * variation;
    const v3 = Math.sin((x + width) * 0.1) * variation;
    const v4 = Math.cos((y + height) * 0.1) * variation;

    return `
      M ${x + radius + v1} ${y}
      L ${x + width - radius + v2} ${y}
      Q ${x + width} ${y} ${x + width} ${y + radius}
      L ${x + width} ${y + height - radius + v3}
      Q ${x + width} ${y + height} ${x + width - radius} ${y + height}
      L ${x + radius + v4} ${y + height}
      Q ${x} ${y + height} ${x} ${y + height - radius}
      L ${x} ${y + radius + v1}
      Q ${x} ${y} ${x + radius} ${y}
      Z
    `;
  };

  const blobPath = createBlobPath(bounds);
  const filterId = `pattern-blur-${pattern.id}`;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(pattern);
      }}
      style={{ cursor: isCustom ? "pointer" : "default" }}
      opacity={isHovered ? 1 : 0.8}
    >
      <defs>
        {/* Soft blur filter for blob */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      {/* Blob background */}
      <path
        d={blobPath}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={PATTERN_ZONE.strokeWidth}
        strokeDasharray={isCustom ? "none" : "6,4"}
        filter={`url(#${filterId})`}
        style={{ transition: "all 0.3s ease" }}
      />

      {/* Pattern label */}
      {pattern.label && (
        <g>
          <rect
            x={bounds.x + 10}
            y={bounds.y + 10}
            width={pattern.label.length * 7 + 20}
            height={24}
            rx={4}
            fill="rgba(15, 23, 36, 0.8)"
            stroke={strokeColor}
            strokeWidth={1}
          />
          <text
            x={bounds.x + 20}
            y={bounds.y + 22}
            fontSize={11}
            fill={isCustom ? "#10B981" : "#6C63FF"}
            fontWeight={600}
          >
            {pattern.label}
          </text>
        </g>
      )}

      {/* Node count badge */}
      <g>
        <circle
          cx={bounds.x + bounds.width - 20}
          cy={bounds.y + 20}
          r={12}
          fill="rgba(15, 23, 36, 0.9)"
          stroke={strokeColor}
          strokeWidth={1.5}
        />
        <text
          x={bounds.x + bounds.width - 20}
          y={bounds.y + 20}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fill="#E6EEF8"
          fontWeight={600}
        >
          {pattern.nodeIds.length}
        </text>
      </g>

      {/* Hover glow effect */}
      {isHovered && (
        <path
          d={blobPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={4}
          opacity={0.3}
          style={{ filter: "blur(6px)" }}
        />
      )}
    </g>
  );
}
