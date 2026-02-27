// src/components/ConstellationNebula.jsx
//
// Renders a collapsed constellation as a pulsing nebula blob in SVG space.
// Lives inside the main SpaceCanvas <g transform="..."> element so it shares
// the same pan/zoom coordinate system as planets and moons.
//
// Props
//   constellation   { id, label, nodeIds, collapsed, archetype, note }
//   position        { x, y }  centroid of member nodes in world coordinates
//   onClick         () => void   — expands the constellation
//   onContextMenu   (e) => void  — right-click for Dissolve / Edit options

import React from "react";
import { CONSTELLATION_ARCHETYPES } from "../utils/constellationConfig";

const NEBULA_COLOR = "#6C63FF";
const NEBULA_COLOR_MID = "#8B5CF6";

export default function ConstellationNebula({
	constellation,
	position,
	onClick,
	onContextMenu,
}) {
	const { id, label, nodeIds, archetype, note } = constellation;
	const gradId = `nebula-grad-${id}`;
	const filterId = `nebula-blur-${id}`;
	const nodeCount = nodeIds.length;

	const archetypeData = CONSTELLATION_ARCHETYPES?.[archetype || ""];
	const emoji = archetypeData?.emoji || "";

	const displayLabel = label.length > 22 ? label.slice(0, 20) + "…" : label;
	const hasNote = note && note.trim().length > 0;

	return (
		<g
			transform={`translate(${position.x}, ${position.y})`}
			style={{ cursor: "pointer" }}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			onContextMenu={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onContextMenu(e);
			}}>
			<defs>
				<radialGradient id={gradId} cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor={NEBULA_COLOR} stopOpacity={0.9} />
					<stop offset="45%" stopColor={NEBULA_COLOR_MID} stopOpacity={0.5} />
					<stop offset="100%" stopColor={NEBULA_COLOR} stopOpacity={0} />
				</radialGradient>

				<filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="6" result="blur" />
					<feComposite in="SourceGraphic" in2="blur" operator="over" />
				</filter>
			</defs>

			{/* Outer glow layer */}
			<circle
				r={48}
				fill={`url(#${gradId})`}
				opacity={0.35}
				filter={`url(#${filterId})`}>
				<animate
					attributeName="r"
					values="46;50;46"
					dur="4s"
					repeatCount="indefinite"
				/>
				<animate
					attributeName="opacity"
					values="0.3;0.45;0.3"
					dur="4s"
					repeatCount="indefinite"
				/>
			</circle>

			{/* Mid layer */}
			<circle r={34} fill={`url(#${gradId})`} opacity={0.55}>
				<animate
					attributeName="r"
					values="33;36;33"
					dur="4s"
					begin="0.5s"
					repeatCount="indefinite"
				/>
			</circle>

			{/* Core */}
			<circle r={20} fill={NEBULA_COLOR} opacity={0.75}>
				<animate
					attributeName="r"
					values="19;21;19"
					dur="4s"
					begin="1s"
					repeatCount="indefinite"
				/>
				<animate
					attributeName="opacity"
					values="0.7;0.85;0.7"
					dur="4s"
					begin="1s"
					repeatCount="indefinite"
				/>
			</circle>

			{/* Bright centre dot */}
			<circle r={6} fill="white" opacity={0.6} />

			{/* Archetype emoji above label */}
			{emoji && (
				<text
					y={-32}
					textAnchor="middle"
					fontSize={16}
					style={{ pointerEvents: "none", userSelect: "none" }}>
					{emoji}
				</text>
			)}

			{/* Label */}
			<text
				y={62}
				textAnchor="middle"
				fill="rgba(255,255,255,0.9)"
				fontSize={11}
				fontFamily="system-ui, sans-serif"
				fontWeight={500}
				style={{ pointerEvents: "none", userSelect: "none" }}>
				{displayLabel}
			</text>

			{/* Node count + note indicator */}
			<text
				y={76}
				textAnchor="middle"
				fill="rgba(255,255,255,0.4)"
				fontSize={10}
				fontFamily="system-ui, sans-serif"
				style={{ pointerEvents: "none", userSelect: "none" }}>
				{nodeCount} {nodeCount === 1 ? "node" : "nodes"}
				{hasNote ? " · ✦" : ""}
			</text>
		</g>
	);
}
