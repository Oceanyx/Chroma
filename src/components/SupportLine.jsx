// src/components/SupportLine.jsx
import React from "react";

export default function SupportLine({
	moonA,
	moonB,
	posA,
	posB,
	isHovered = false,
	onClick,
}) {
	if (!posA || !posB) return null;

	// Calculate smooth bezier curve
	const midX = (posA.x + posB.x) / 2;
	const midY = (posA.y + posB.y) / 2;

	const dx = posB.x - posA.x;
	const dy = posB.y - posA.y;
	const perpX = -dy * 0.15;
	const perpY = dx * 0.15;

	const controlX = midX + perpX;
	const controlY = midY + perpY;

	const pathData = `M ${posA.x} ${posA.y} Q ${controlX} ${controlY} ${posB.x} ${posB.y}`;

	const strokeColor = isHovered ? "#34D399" : "#10B981";
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

			{/* Main support curve */}
			<path
				d={pathData}
				stroke={strokeColor}
				strokeWidth={strokeWidth}
				fill="none"
				opacity={isHovered ? 0.8 : 0.5}
				style={{ transition: "all 0.2s ease", pointerEvents: "none" }}
			/>

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

			{/* Label on hover */}
			{isHovered && (
				<g>
					<rect
						x={midX - 40}
						y={midY - 15}
						width={80}
						height={26}
						rx={4}
						fill="rgba(15, 23, 36, 0.95)"
						stroke="#10B981"
						strokeWidth={1}
					/>
					<text
						x={midX}
						y={midY}
						textAnchor="middle"
						dominantBaseline="central"
						fontSize={11}
						fill="#10B981"
						fontWeight={600}
						style={{ pointerEvents: "none" }}>
						Support 🤝
					</text>
				</g>
			)}

			{/* Subtle pulse animation */}
			<circle r="3" fill="#10B981" opacity={0.6}>
				<animateMotion dur="3s" repeatCount="indefinite" path={pathData} />
				<animate
					attributeName="opacity"
					values="0.3;0.8;0.3"
					dur="3s"
					repeatCount="indefinite"
				/>
			</circle>
		</g>
	);
}
