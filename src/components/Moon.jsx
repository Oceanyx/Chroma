// src/components/Moon.jsx - Size Variations & Glow Patterns
import React from "react";
import { moonConfig } from "../seedData";

export default function Moon({
  node,
  position,
  isHovered,
  isSelected,
  isGhost = false,
  count = 1,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const domainConfig = moonConfig.domain[node?.domain || "private"];
  const radius = domainConfig.radius;

  const x = position?.x || node.position?.x || 0;
  const y = position?.y || node.position?.y || 0;

  const gradientId = `moon-gradient-${node?.id || Math.random()}`;
  const glowId = `moon-glow-${node?.id || Math.random()}`;

  const opacity = isGhost ? (isHovered ? 0.7 : 0.3) : 1;

  // Glow pattern based on domain
  const renderGlowPattern = () => {
    if (isGhost) return null;

    switch (domainConfig.glowPattern) {
      case "inward": // Private - soft inward pulse
        return (
          <circle
            cx={x}
            cy={y}
            r={radius * 1.8}
            fill={domainConfig.color}
            opacity={domainConfig.glowIntensity * 0.3}
          >
            <animate
              attributeName="r"
              values={`${radius * 2};${radius * 1.6};${radius * 2}`}
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values={`${domainConfig.glowIntensity * 0.2};${
                domainConfig.glowIntensity * 0.4
              };${domainConfig.glowIntensity * 0.2}`}
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
        );

      case "outward": // Public - radiating outward
        return (
          <>
            <circle
              cx={x}
              cy={y}
              r={radius * 1.5}
              fill={domainConfig.color}
              opacity={domainConfig.glowIntensity * 0.3}
            >
              <animate
                attributeName="r"
                values={`${radius * 1.3};${radius * 2.2};${radius * 1.3}`}
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values={`${domainConfig.glowIntensity * 0.4};${
                  domainConfig.glowIntensity * 0.1
                };${domainConfig.glowIntensity * 0.4}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx={x}
              cy={y}
              r={radius * 2.5}
              fill={domainConfig.color}
              opacity={domainConfig.glowIntensity * 0.15}
            >
              <animate
                attributeName="r"
                values={`${radius * 2};${radius * 3};${radius * 2}`}
                dur="5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values={`${domainConfig.glowIntensity * 0.2};${
                  domainConfig.glowIntensity * 0.05
                };${domainConfig.glowIntensity * 0.2}`}
                dur="5s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        );

      case "shimmer": // Abstract - geometric shimmer
        return (
          <>
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const distance = radius * 1.8;
              return (
                <circle
                  key={i}
                  cx={x + Math.cos(rad) * distance}
                  cy={y + Math.sin(rad) * distance}
                  r={radius * 0.3}
                  fill={domainConfig.color}
                  opacity={domainConfig.glowIntensity * 0.4}
                >
                  <animate
                    attributeName="opacity"
                    values={`0;${domainConfig.glowIntensity * 0.6};0`}
                    dur="3s"
                    begin={`${i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })}
          </>
        );

      default:
        return null;
    }
  };

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
          <stop offset="0%" stopColor={domainConfig.color} stopOpacity="0.95" />
          <stop offset="60%" stopColor={domainConfig.color} stopOpacity="0.8" />
          <stop
            offset="100%"
            stopColor={domainConfig.color}
            stopOpacity="0.6"
          />
        </radialGradient>
      </defs>

      {/* Glow Pattern */}
      {renderGlowPattern()}

      {/* Main Moon Body */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={`url(#${gradientId})`}
        stroke={isSelected ? "#FFFFFF" : domainConfig.color}
        strokeWidth={isSelected ? 2 : 1}
        strokeOpacity={isGhost ? 0.5 : 0.8}
      />

      {/* Surface Craters (random pattern) */}
      {!isGhost && (
        <>
          <circle
            cx={x - radius * 0.3}
            cy={y - radius * 0.2}
            r={radius * 0.15}
            fill="rgba(0,0,0,0.1)"
          />
          <circle
            cx={x + radius * 0.2}
            cy={y + radius * 0.3}
            r={radius * 0.12}
            fill="rgba(0,0,0,0.08)"
          />
          <circle
            cx={x + radius * 0.35}
            cy={y - radius * 0.25}
            r={radius * 0.08}
            fill="rgba(0,0,0,0.06)"
          />
        </>
      )}

      {/* Highlight Spot */}
      <ellipse
        cx={x - radius * 0.35}
        cy={y - radius * 0.35}
        rx={radius * 0.4}
        ry={radius * 0.3}
        fill="rgba(255, 255, 255, 0.5)"
        opacity={isGhost ? 0.2 : 0.7}
      />

      {/* Aggregate Count Badge */}
      {!isGhost && count > 1 && (
        <g>
          <circle
            cx={x + radius * 0.7}
            cy={y - radius * 0.7}
            r={8}
            fill="#FFFFFF"
            stroke={domainConfig.color}
            strokeWidth={2}
          />
          <text
            x={x + radius * 0.7}
            y={y - radius * 0.7}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight="bold"
            fill={domainConfig.color}
          >
            {count}
          </text>
        </g>
      )}

      {/* Ghost Moon Domain Label */}
      {isGhost && isHovered && (
        <text
          x={x}
          y={y + radius + 16}
          textAnchor="middle"
          fontSize={12}
          fill={domainConfig.color}
          fontWeight={600}
          opacity={0.9}
        >
          {domainConfig.name}
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
            y={y + radius + 10}
            width={140}
            height={32}
            rx={5}
            fill="rgba(15, 23, 36, 0.95)"
            stroke={domainConfig.color}
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <text
            x={x}
            y={y + radius + 26}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fill="#E6EEF8"
            fontWeight={400}
            style={{ pointerEvents: "none" }}
          >
            {node.text.length > 16 ? node.text.slice(0, 16) + "..." : node.text}
          </text>
        </g>
      )}
    </g>
  );
}
