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

	const strokeColor = isHovered ? "#818CF8" : "#6366F1";
	const strokeWidth = isHovered ? 2.5 : 1.5;

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
				opacity={isHovered ? 0.75 : 0.4}
				style={{ transition: "all 0.2s ease", pointerEvents: "none" }}>
				<animate
					attributeName="opacity"
					values={isHovered ? "0.5;0.85;0.5" : "0.22;0.45;0.22"}
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
						stroke="#6366F1"
						strokeWidth={1}
					/>
					<text
						x={midX}
						y={midY}
						textAnchor="middle"
						dominantBaseline="central"
						fontSize={11}
						fill="#818CF8"
						fontWeight={600}
						style={{ pointerEvents: "none" }}>
						Echo ◈
					</text>
				</g>
			)}
		</g>
	);
}
