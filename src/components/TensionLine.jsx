// src/components/TensionLine.jsx
import React from "react";

export default function TensionLine({
	moonA,
	moonB,
	posA,
	posB,
	intensity = 2,
	isHovered = false,
	onClick,
}) {
	if (!posA || !posB) return null;

	const dx = posB.x - posA.x;
	const dy = posB.y - posA.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance === 0) return null;

	// Generate zigzag points
	const segments = 8;
	const points = [];

	for (let i = 0; i <= segments; i++) {
		const t = i / segments;
		const baseX = posA.x + dx * t;
		const baseY = posA.y + dy * t;

		const perpX = -dy / distance;
		const perpY = dx / distance;
		const offset = (i % 2 === 0 ? 1 : -1) * (6 + intensity * 2);

		points.push({
			x: baseX + perpX * offset,
			y: baseY + perpY * offset,
		});
	}

	const pathData =
		`M ${points[0].x} ${points[0].y} ` +
		points
			.slice(1)
			.map((p) => `L ${p.x} ${p.y}`)
			.join(" ");

	const intensityColors = {
		1: "#FB923C", // Light orange
		2: "#F97316", // Medium orange
		3: "#EA580C", // Deep orange/red
	};

	const strokeColor = isHovered
		? "#FCA5A5"
		: intensityColors[intensity] || intensityColors[2];
	const strokeWidth = isHovered ? 4 : 2 + intensity;

	const midX = (posA.x + posB.x) / 2;
	const midY = (posA.y + posB.y) / 2;

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

			{/* Main tension zigzag */}
			<path
				d={pathData}
				stroke={strokeColor}
				strokeWidth={strokeWidth}
				fill="none"
				opacity={isHovered ? 0.9 : 0.7}
				style={{ transition: "all 0.2s ease", pointerEvents: "none" }}
			/>

			{/* Glow effect on hover */}
			{isHovered && (
				<path
					d={pathData}
					stroke={strokeColor}
					strokeWidth={8}
					fill="none"
					opacity={0.3}
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
						stroke={strokeColor}
						strokeWidth={1}
					/>
					<text
						x={midX}
						y={midY}
						textAnchor="middle"
						dominantBaseline="central"
						fontSize={11}
						fill={strokeColor}
						fontWeight={600}
						style={{ pointerEvents: "none" }}>
						Tension ⚡
					</text>
				</g>
			)}
		</g>
	);
}
