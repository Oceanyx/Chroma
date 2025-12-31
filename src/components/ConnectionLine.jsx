// src/components/ConnectionLine.jsx
import React from "react";
import { CONNECTION, PLANET, MOON } from "../utils/constants";

export default function ConnectionLine({
  edge,
  sourceNode,
  targetNode,
  isHovered,
  onClick,
}) {
  if (!sourceNode || !targetNode) return null;

  // Calculate centers of nodes
  const getNodeCenter = (node) => {
    if (node.type === "O" || node.type === "A") {
      const radius = PLANET[node.type].radius;
      return {
        x: node.position.x + radius,
        y: node.position.y + radius,
      };
    } else if (node.type === "R") {
      // Moon - use its calculated position
      return {
        x: node.position.x,
        y: node.position.y,
      };
    }
    return { x: 0, y: 0 };
  };

  const start = getNodeCenter(sourceNode);
  const end = getNodeCenter(targetNode);

  // Calculate arrow endpoint (stop before touching node)
  const getArrowEndpoint = (start, end, nodeType) => {
    const radius =
      nodeType === "O" || nodeType === "A"
        ? PLANET[nodeType].radius
        : MOON.radius;

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

  const arrowEnd = getArrowEndpoint(start, end, targetNode.type);

  // Arrow calculation
  const calculateArrowPoints = (x, y, angle) => {
    const size = CONNECTION.arrowSize;
    const point1 = {
      x: x - size * Math.cos(angle - Math.PI / 6),
      y: y - size * Math.sin(angle - Math.PI / 6),
    };
    const point2 = {
      x: x - size * Math.cos(angle + Math.PI / 6),
      y: y - size * Math.sin(angle + Math.PI / 6),
    };
    return `${x},${y} ${point1.x},${point1.y} ${point2.x},${point2.y}`;
  };

  const angle = Math.atan2(arrowEnd.y - start.y, arrowEnd.x - start.x);
  const arrowPoints = calculateArrowPoints(arrowEnd.x, arrowEnd.y, angle);

  // Curved path for longer connections
  const distance = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );

  const useCurve = distance > 200;

  let pathData;
  if (useCurve) {
    // Quadratic bezier curve
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const offsetX = (end.y - start.y) * 0.1;
    const offsetY = (start.x - end.x) * 0.1;
    pathData = `M ${start.x} ${start.y} Q ${midX + offsetX} ${midY + offsetY} ${
      arrowEnd.x
    } ${arrowEnd.y}`;
  } else {
    // Straight line
    pathData = `M ${start.x} ${start.y} L ${arrowEnd.x} ${arrowEnd.y}`;
  }

  const strokeWidth = isHovered
    ? CONNECTION.strokeWidthHover
    : CONNECTION.strokeWidth;
  const strokeColor = isHovered ? CONNECTION.colorHover : CONNECTION.color;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(edge);
      }}
      style={{ cursor: "pointer" }}
    >
      {/* Invisible wider path for easier hover detection */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
        style={{ pointerEvents: "stroke" }}
      />

      {/* Visible connection line */}
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={isHovered ? 0.9 : 0.6}
        style={{
          transition: "all 0.2s ease",
          pointerEvents: "none",
        }}
      >
        {/* Animated dash for flow effect */}
        {!isHovered && (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="20"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Arrow head */}
      <polygon
        points={arrowPoints}
        fill={strokeColor}
        opacity={isHovered ? 0.9 : 0.6}
        style={{
          transition: "all 0.2s ease",
          pointerEvents: "none",
        }}
      />

      {/* Glow effect on hover */}
      {isHovered && (
        <path
          d={pathData}
          stroke={strokeColor}
          strokeWidth={strokeWidth + 4}
          fill="none"
          opacity={0.2}
          style={{
            filter: "blur(4px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Connection label on hover */}
      {isHovered && edge.label && (
        <g>
          {/* Label background */}
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
          {/* Label text */}
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
