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

const NEBULA_COLOR = "#A78BFA";
const NEBULA_COLOR_MID = "#C4B5FD";
const NEBULA_COLOR_BRIGHT = "#E9D5FF";

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
					<stop offset="0%" stopColor={NEBULA_COLOR_BRIGHT} stopOpacity={1} />
					<stop offset="40%" stopColor={NEBULA_COLOR_MID} stopOpacity={0.75} />
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
				opacity={0.65}
				filter={`url(#${filterId})`}>
				<animate
					attributeName="r"
					values="46;50;46"
					dur="4s"
					repeatCount="indefinite"
				/>
				<animate
					attributeName="opacity"
					values="0.6;0.75;0.6"
					dur="4s"
					repeatCount="indefinite"
				/>
			</circle>

			{/* Mid layer */}
			<circle r={34} fill={`url(#${gradId})`} opacity={0.85}>
				<animate
					attributeName="r"
					values="33;36;33"
					dur="4s"
					begin="0.5s"
					repeatCount="indefinite"
				/>
			</circle>

			{/* Crisp boundary ring — the soft blur alone read as "fades into the
			    background"; a defined edge gives it a confident shape at a glance */}
			<circle
				r={36}
				fill="none"
				stroke={NEBULA_COLOR_BRIGHT}
				strokeWidth={2}
				opacity={0.8}
			/>

			{/* Core */}
			<circle r={22} fill={NEBULA_COLOR_MID} opacity={1}>
				<animate
					attributeName="r"
					values="21;23;21"
					dur="4s"
					begin="1s"
					repeatCount="indefinite"
				/>
			</circle>

			{/* Bright centre dot */}
			<circle r={10} fill="white" opacity={0.95} />

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
				fill="rgba(255,255,255,0.95)"
				fontSize={12}
				fontFamily="system-ui, sans-serif"
				fontWeight={600}
				style={{
					pointerEvents: "none",
					userSelect: "none",
					paintOrder: "stroke",
					stroke: "rgba(8,13,25,0.85)",
					strokeWidth: 4,
					strokeLinejoin: "round",
				}}>
				{displayLabel}
			</text>

			{/* Node count + note indicator */}
			<text
				y={77}
				textAnchor="middle"
				fill="rgba(255,255,255,0.6)"
				fontSize={11}
				fontFamily="system-ui, sans-serif"
				style={{
					pointerEvents: "none",
					userSelect: "none",
					paintOrder: "stroke",
					stroke: "rgba(8,13,25,0.85)",
					strokeWidth: 3,
					strokeLinejoin: "round",
				}}>
				{nodeCount} {nodeCount === 1 ? "node" : "nodes"}
				{hasNote ? " · ✦" : ""}
			</text>
		</g>
	);
}
