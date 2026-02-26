// src/components/ConnectionLine.jsx - V2.3
// Changes from V2.2:
//   - 6 connection types with casual, verb-first names:
//       followed, caused, triggered, enabled, contradicts, resolved
//   - Old keys (temporal, causal, intention-action, intention-pattern) aliased
//     so existing saved edges still render correctly
//   - Visual: "contradicts" uses red dash, "resolved" uses teal, rest keep palette
import React from "react";
import { planetConfig } from "../seedData";

// ─── Type definitions ────────────────────────────────────────────────────────
export const CONNECTION_TYPES = {
	followed: {
		label: "Followed",
		description: "A then B — neutral sequence",
		color: "rgba(148, 163, 184, 0.45)",
		particleColor: "#94A3B8",
		dotColor: "#94A3B8",
		strokeWidth: 1.5,
		dashArray: "4,5",
		showArrow: false,
	},
	caused: {
		label: "Caused",
		description: "A directly produced B",
		color: "rgba(230, 238, 248, 0.75)",
		particleColor: "#E6EEF8",
		dotColor: "#E6EEF8",
		strokeWidth: 2,
		dashArray: "none",
		showArrow: true,
	},
	triggered: {
		label: "Triggered",
		description: "A was the catalyst for B",
		color: "rgba(251, 191, 36, 0.75)",
		particleColor: "#FBBF24",
		dotColor: "#FBBF24",
		strokeWidth: 2,
		dashArray: "none",
		showArrow: true,
	},
	enabled: {
		label: "Enabled",
		description: "A made B possible",
		color: "rgba(52, 211, 153, 0.65)",
		particleColor: "#34D399",
		dotColor: "#34D399",
		strokeWidth: 1.5,
		dashArray: "6,3",
		showArrow: true,
	},
	contradicts: {
		label: "Contradicts",
		description: "A and B are in tension",
		color: "rgba(248, 113, 113, 0.65)",
		particleColor: "#F87171",
		dotColor: "#F87171",
		strokeWidth: 2,
		dashArray: "3,4",
		showArrow: false,
	},
	resolved: {
		label: "Resolved",
		description: "A brought closure to B",
		color: "rgba(129, 140, 248, 0.65)",
		particleColor: "#818CF8",
		dotColor: "#818CF8",
		strokeWidth: 2,
		dashArray: "none",
		showArrow: true,
	},
};

// Back-compat aliases — old edges saved with previous key names still render
const TYPE_ALIASES = {
	temporal: "followed",
	causal: "caused",
	"intention-action": "triggered",
	"intention-pattern": "enabled",
};

function resolveType(raw) {
	const key = TYPE_ALIASES[raw] || raw;
	return CONNECTION_TYPES[key] ? key : "followed";
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ConnectionLine({
	edge,
	sourceNode,
	targetNode,
	isHovered,
	onClick,
	onMouseEnter,
	onMouseLeave,
}) {
	if (!sourceNode || !targetNode) return null;
	if (!sourceNode.position || !targetNode.position) return null;

	const typeKey = resolveType(edge.type);
	const style = CONNECTION_TYPES[typeKey];
	const radius = planetConfig.baseRadius;

	const start = {
		x: sourceNode.position.x + radius,
		y: sourceNode.position.y + radius,
	};
	const end = {
		x: targetNode.position.x + radius,
		y: targetNode.position.y + radius,
	};

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

	const arrowPoints = style.showArrow
		? `${arrowEnd.x},${arrowEnd.y} ${
				arrowEnd.x - arrowSize * Math.cos(angle - Math.PI / 6)
			},${arrowEnd.y - arrowSize * Math.sin(angle - Math.PI / 6)} ${
				arrowEnd.x - arrowSize * Math.cos(angle + Math.PI / 6)
			},${arrowEnd.y - arrowSize * Math.sin(angle + Math.PI / 6)}`
		: "";

	const strokeColor = isHovered ? "rgba(255,255,255,0.9)" : style.color;
	const particleColor = isHovered ? "#FFFFFF" : style.particleColor;

	const labelX = (start.x + arrowEnd.x) / 2;
	const labelY = (start.y + arrowEnd.y) / 2;
	const displayLabel = edge.label || style.label;

	return (
		<g
			onClick={(e) => {
				e.stopPropagation();
				onClick?.(edge, e.clientX, e.clientY);
			}}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			style={{ cursor: "pointer" }}>
			{/* Wide hit area */}
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
				strokeDasharray={
					style.dashArray === "none" ? undefined : style.dashArray
				}
				fill="none"
				opacity={isHovered ? 0.95 : 0.65}
				style={{ transition: "all 0.2s ease", pointerEvents: "none" }}
			/>

			{/* Arrow head */}
			{style.showArrow && arrowPoints && (
				<polygon
					points={arrowPoints}
					fill={strokeColor}
					opacity={isHovered ? 0.95 : 0.65}
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
						values={`${isHovered ? 0.3 : 0.2};${isHovered ? 0.9 : 0.7};${isHovered ? 0.3 : 0.2}`}
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

			{/* Hover label */}
			{isHovered &&
				(() => {
					const labelW = Math.min(displayLabel.length * 7 + 28, 160);
					return (
						<g style={{ pointerEvents: "none" }}>
							<rect
								x={labelX - labelW / 2}
								y={labelY - 14}
								width={labelW}
								height={24}
								rx={5}
								fill="rgba(10,15,28,0.96)"
								stroke="rgba(148,163,184,0.18)"
								strokeWidth={1}
							/>
							<circle
								cx={labelX - labelW / 2 + 12}
								cy={labelY - 2}
								r={4}
								fill={style.dotColor}
								opacity={0.85}
							/>
							<text
								x={labelX - labelW / 2 + 22}
								y={labelY - 2}
								dominantBaseline="central"
								fontSize={11}
								fill="#E6EEF8"
								fontWeight={500}
								style={{ userSelect: "none" }}>
								{displayLabel}
							</text>
						</g>
					);
				})()}
		</g>
	);
}
