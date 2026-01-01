// src/components/ConnectionLine.jsx - Flowing Particles
import React from "react";
import { planetConfig } from "../seedData";

export default function ConnectionLine({
  edge,
  sourceNode,
  targetNode,
  isHovered,
  onClick,
}) {
  if (!sourceNode || !targetNode) return null;

  const getNodeCenter = (node) => {
    const radius = planetConfig.baseRadius;
    return {
      x: node.position.x + radius,
      y: node.position.y + radius,
    };
  };

  const start = getNodeCenter(sourceNode);
  const end = getNodeCenter(targetNode);

  const getArrowEndpoint = (start, end) => {
    const radius = planetConfig.baseRadius;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return end;

    const ratio = (distance - radius - 5) / distance;

    return {
      x: start.x + dx * ratio,
      y: start.y + dy * ratio,
    };
  };

  const arrowEnd = getArrowEndpoint(start, end);
  const distance = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  const useCurve = distance > 200;

  let pathData;
  if (useCurve) {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const offsetX = (end.y - start.y) * 0.1;
    const offsetY = (start.x - end.x) * 0.1;
    pathData = `M ${start.x} ${start.y} Q ${midX + offsetX} ${midY + offsetY} ${
      arrowEnd.x
    } ${arrowEnd.y}`;
  } else {
    pathData = `M ${start.x} ${start.y} L ${arrowEnd.x} ${arrowEnd.y}`;
  }

  const angle = Math.atan2(arrowEnd.y - start.y, arrowEnd.x - start.x);
  const arrowSize = 8;
  const arrowPoints = `${arrowEnd.x},${arrowEnd.y} ${
    arrowEnd.x - arrowSize * Math.cos(angle - Math.PI / 6)
  },${arrowEnd.y - arrowSize * Math.sin(angle - Math.PI / 6)} ${
    arrowEnd.x - arrowSize * Math.cos(angle + Math.PI / 6)
  },${arrowEnd.y - arrowSize * Math.sin(angle + Math.PI / 6)}`;

  const strokeColor = isHovered
    ? "rgba(255, 255, 255, 0.9)"
    : "rgba(148, 163, 184, 0.6)";
  const particleColor = isHovered ? "#FFFFFF" : "#6C63FF";

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(edge);
      }}
      style={{ cursor: "pointer" }}
    >
      {/* Invisible wider path for hover */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
        style={{ pointerEvents: "stroke" }}
      />

      {/* Main connection line */}
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth={2}
        fill="none"
        opacity={isHovered ? 0.9 : 0.6}
        style={{ transition: "all 0.2s ease", pointerEvents: "none" }}
      />

      {/* Arrow head */}
      <polygon
        points={arrowPoints}
        fill={strokeColor}
        opacity={isHovered ? 0.9 : 0.6}
        style={{ transition: "all 0.2s ease", pointerEvents: "none" }}
      />

      {/* Flowing Particles */}
      {[0, 0.33, 0.66].map((offset, i) => (
        <circle
          key={i}
          r={isHovered ? 4 : 3}
          fill={particleColor}
          opacity={isHovered ? 0.9 : 0.7}
          style={{ pointerEvents: "none" }}
        >
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            begin={`${offset}s`}
            path={pathData}
          />
          <animate
            attributeName="opacity"
            values={`${isHovered ? 0.3 : 0.2};${isHovered ? 0.9 : 0.7};${
              isHovered ? 0.3 : 0.2
            }`}
            dur="3s"
            repeatCount="indefinite"
            begin={`${offset}s`}
          />
        </circle>
      ))}

      {/* Glow effect on hover */}
      {isHovered && (
        <path
          d={pathData}
          stroke={strokeColor}
          strokeWidth={6}
          fill="none"
          opacity={0.2}
          style={{ filter: "blur(4px)", pointerEvents: "none" }}
        />
      )}

      {/* Connection label on hover */}
      {isHovered && edge.label && (
        <g>
          <rect
            x={(start.x + end.x) / 2 - 40}
            y={(start.y + end.y) / 2 - 15}
            width={80}
            height={26}
            rx={4}
            fill="rgba(15, 23, 36, 0.95)"
            stroke="rgba(148, 163, 184, 0.3)"
            strokeWidth={1}
          />
          <text
            x={(start.x + end.x) / 2}
            y={(start.y + end.y) / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fill="#E6EEF8"
            fontWeight={500}
            style={{ pointerEvents: "none" }}
          >
            {edge.label || "Connected"}
          </text>
        </g>
      )}
    </g>
  );
}
