// src/components/EchoLine.jsx
// Associative link ("this reminded me of that") — the lightest of the three
// relationship types. Visually distinct from Tension (red, urgent) and
// Support (green, flowing) on purpose: dotted and still, a soft shimmer
// rather than active motion, echoing the Symbolic lens's indigo since an
// association is fundamentally that kind of evocative, non-literal act.
import React from "react";

export default function EchoLine({
	moonA,
	moonB,
	posA,
	posB,
	isHovered = false,
	onClick,
}) {
	if (!posA || !posB) return null;

	const midX = (posA.x + posB.x) / 2;
	const midY = (posA.y + posB.y) / 2;

	const dx = posB.x - posA.x;
	const dy = posB.y - posA.y;
	const perpX = -dy * 0.1;
	const perpY = dx * 0.1;

	const controlX = midX + perpX;
	const controlY = midY + perpY;

	const pathData = `M ${posA.x} ${posA.y} Q ${controlX} ${controlY} ${posB.x} ${posB.y}`;

	const strokeColor = isHovered ? "#A5B4FC" : "#818CF8";
	const strokeWidth = isHovered ? 3 : 2;

	return (
		<g
			onClick={(e) => {
				e.stopPropagation();
				onClick?.();
			}}
			style={{ cursor: "pointer" }}>
			{/* Invisible wider path for easier clicking */}
			<path
				d={pathData}
				stroke="transparent"
				strokeWidth={20}
				fill="none"
				style={{ pointerEvents: "stroke" }}
			/>

			{/* Main echo curve — dotted, still */}
			<path
				d={pathData}
				stroke={strokeColor}
				strokeWidth={strokeWidth}
				strokeDasharray="1.5 6"
				strokeLinecap="round"
				fill="none"
				opacity={isHovered ? 0.9 : 0.75}
				style={{
					transition: "stroke-width 0.2s ease",
					pointerEvents: "none",
				}}>
				<animate
					attributeName="opacity"
					values={isHovered ? "0.75;1;0.75" : "0.55;0.85;0.55"}
					dur="4s"
					repeatCount="indefinite"
				/>
			</path>

			{/* Glow on hover */}
			{isHovered && (
				<path
					d={pathData}
					stroke={strokeColor}
					strokeWidth={5}
					fill="none"
					opacity={0.18}
					style={{ filter: "blur(4px)", pointerEvents: "none" }}
				/>
			)}

			{/* Persistent midpoint marker — visible at rest, not just on
			    hover, so the line reads as clickable before you've found
			    it by accident. */}
			{!isHovered && (
				<circle
					cx={midX}
					cy={midY}
					r={5}
					fill="rgba(15, 23, 36, 0.9)"
					stroke={strokeColor}
					strokeWidth={1.5}
					opacity={0.85}
					style={{ pointerEvents: "none" }}
				/>
			)}

			{/* Label on hover */}
			{isHovered && (
				<g>
					<rect
						x={midX - 34}
						y={midY - 15}
						width={68}
						height={26}
						rx={4}
						fill="rgba(15, 23, 36, 0.95)"
						stroke="#818CF8"
						strokeWidth={1}
					/>
					<text
						x={midX}
						y={midY}
						textAnchor="middle"
						dominantBaseline="central"
						fontSize={11}
						fill="#A5B4FC"
						fontWeight={600}
						style={{ pointerEvents: "none" }}>
						Echo ◈
					</text>
				</g>
			)}
		</g>
	);
}
