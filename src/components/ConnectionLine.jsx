// src/components/ConnectionLine.jsx - V2.1 with position guard
import React from "react";
import { planetConfig } from "../seedData";

const CONNECTION_TYPES = {
	temporal: {
		color: "rgba(148, 163, 184, 0.4)",
		particleColor: "#94A3B8",
		strokeWidth: 1,
		dashArray: "4,4",
	},
	causal: {
		color: "rgba(230, 238, 248, 0.7)",
		particleColor: "#E6EEF8",
		strokeWidth: 2,
		dashArray: "none",
	},
	"intention-action": {
		color: "rgba(251, 191, 36, 0.7)",
		particleColor: "#FBBF24",
		strokeWidth: 2,
		dashArray: "none",
	},
	"intention-pattern": {
		color: "rgba(251, 191, 36, 0.6)",
		particleColor: "#FBBF24",
		strokeWidth: 3,
		dashArray: "6,4",
	},
};

export default function ConnectionLine({
	edge,
	sourceNode,
	targetNode,
	isHovered,
	onClick,
}) {
	// Guard: both nodes must exist and have a position property
	if (!sourceNode || !targetNode) return null;
	if (!sourceNode.position || !targetNode.position) return null;

	const connectionType = edge.type || "temporal";
	const style = CONNECTION_TYPES[connectionType] || CONNECTION_TYPES.temporal;

	const radius = planetConfig.baseRadius;

	const start = {
		x: sourceNode.position.x + radius,
		y: sourceNode.position.y + radius,
	};
	const end = {
		x: targetNode.position.x + radius,
		y: targetNode.position.y + radius,
	};

	// Offset endpoint to stop at planet surface
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	let arrowEnd = end;
	if (distance > 0) {
		const ratio = (distance - radius - 5) / distance;
		arrowEnd = {
			x: start.x + dx * ratio,
			y: start.y + dy * ratio,
		};
	}

	const useCurve = distance > 200;
	let pathData;
	if (useCurve) {
		const midX = (start.x + end.x) / 2;
		const midY = (start.y + end.y) / 2;
		const offsetX = (end.y - start.y) * 0.1;
		const offsetY = (start.x - end.x) * 0.1;
		pathData = `M ${start.x} ${start.y} Q ${midX + offsetX} ${midY + offsetY} ${arrowEnd.x} ${arrowEnd.y}`;
	} else {
		pathData = `M ${start.x} ${start.y} L ${arrowEnd.x} ${arrowEnd.y}`;
	}

	const angle = Math.atan2(arrowEnd.y - start.y, arrowEnd.x - start.x);
	const arrowSize = 8;
	const showArrow = connectionType !== "temporal";

	const arrowPoints = showArrow
		? `${arrowEnd.x},${arrowEnd.y} ${
				arrowEnd.x - arrowSize * Math.cos(angle - Math.PI / 6)
			},${arrowEnd.y - arrowSize * Math.sin(angle - Math.PI / 6)} ${
				arrowEnd.x - arrowSize * Math.cos(angle + Math.PI / 6)
			},${arrowEnd.y - arrowSize * Math.sin(angle + Math.PI / 6)}`
		: "";

	const strokeColor = isHovered ? "rgba(255, 255, 255, 0.9)" : style.color;
	const particleColor = isHovered ? "#FFFFFF" : style.particleColor;

	return (
		<g
			onClick={(e) => {
				e.stopPropagation();
				onClick?.(edge);
			}}
			style={{ cursor: "pointer" }}>
			{/* Wide invisible hit area */}
			<path
				d={pathData}
				stroke="transparent"
				strokeWidth={20}
				fill="none"
				style={{ pointerEvents: "stroke" }}
			/>

			{/* Main line */}
			<path
				d={pathData}
				stroke={strokeColor}
				strokeWidth={style.strokeWidth}
				strokeDasharray={style.dashArray}
				fill="none"
				opacity={isHovered ? 0.9 : 0.6}
				style={{ transition: "all 0.2s ease", pointerEvents: "none" }}
			/>

			{/* Arrow head */}
			{showArrow && (
				<polygon
					points={arrowPoints}
					fill={strokeColor}
					opacity={isHovered ? 0.9 : 0.6}
					style={{ transition: "all 0.2s ease", pointerEvents: "none" }}
				/>
			)}

			{/* Flowing particles */}
			{[0, 0.33, 0.66].map((offset, i) => (
				<circle
					key={i}
					r={isHovered ? 4 : 3}
					fill={particleColor}
					opacity={isHovered ? 0.9 : 0.7}
					style={{ pointerEvents: "none" }}>
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

			{/* Hover glow */}
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

			{/* Label */}
			{isHovered && (
				<g>
					<rect
						x={(start.x + end.x) / 2 - 45}
						y={(start.y + end.y) / 2 - 15}
						width={90}
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
						style={{ pointerEvents: "none", textTransform: "capitalize" }}>
						{edge.label || connectionType}
					</text>
				</g>
			)}
		</g>
	);
}
