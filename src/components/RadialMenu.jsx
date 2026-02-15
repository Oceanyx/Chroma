// src/components/RadialMenu.jsx - Radial menu for moon interactions
import React from "react";

export default function RadialMenu({
	moon,
	onAction,
	onClose,
	dimensionColor,
}) {
	const options = [
		{
			id: "edit",
			icon: "✏️",
			label: "Edit",
			angle: 0,
			action: "edit",
		},
		{
			id: "versions",
			icon: "⟲",
			label: "Versions",
			angle: Math.PI / 3.5,
			action: "versions",
		},
		{
			id: "pin",
			icon: moon.isLocked ? "🔓" : "🔒",
			label: moon.isLocked ? "Unpin" : "Pin",
			angle: (Math.PI * 2) / 3.5,
			action: "toggleLock",
		},
		{
			id: "tension",
			icon: "⚡",
			label: "Tension",
			angle: Math.PI,
			action: "tension",
		},
		{
			id: "support",
			icon: "🤝",
			label: "Support",
			angle: (Math.PI * 4) / 3.5,
			action: "support",
		},
		{
			id: "wobble",
			icon: "🌀",
			label: moon.confidence === "wobbly" ? "Stabilize" : "Wobble",
			angle: (Math.PI * 5) / 3.5,
			action: "toggleWobble",
		},
		{
			id: "delete",
			icon: "🗑️",
			label: "Delete",
			angle: Math.PI * 2 - Math.PI / 7,
			action: "delete",
		},
	];
	const menuRadius = 60; // Distance from moon edge

	return (
		<>
			{/* Background dimming */}
			<circle
				cx={moon.position.x}
				cy={moon.position.y}
				r={120}
				fill="rgba(0, 0, 0, 0.3)"
				style={{ pointerEvents: "auto", cursor: "pointer" }}
				onClick={onClose}
			/>

			{/* Subtle connection lines */}
			{options.map((option) => {
				const x = moon.position.x + Math.cos(option.angle) * menuRadius;
				const y = moon.position.y + Math.sin(option.angle) * menuRadius;
				return (
					<line
						key={`line-${option.id}`}
						x1={moon.position.x}
						y1={moon.position.y}
						x2={x}
						y2={y}
						stroke="rgba(255,255,255,0.1)"
						strokeWidth={1}
						strokeDasharray="2,2"
						style={{ pointerEvents: "none" }}
					/>
				);
			})}

			{/* Menu options */}
			{options.map((option) => {
				const x = moon.position.x + Math.cos(option.angle) * menuRadius;
				const y = moon.position.y + Math.sin(option.angle) * menuRadius;

				return (
					<g
						key={option.id}
						onClick={(e) => {
							e.stopPropagation();
							onAction(option.action);
						}}
						style={{ cursor: "pointer" }}>
						{/* Option background circle */}
						<circle
							cx={x}
							cy={y}
							r={20}
							fill="rgba(30, 41, 59, 0.95)"
							stroke="rgba(255,255,255,0.2)"
							strokeWidth={1}
							style={{ transition: "all 0.2s ease" }}
						/>

						{/* Hover effect */}
						<circle
							cx={x}
							cy={y}
							r={20}
							fill={`${dimensionColor}33`}
							stroke={dimensionColor}
							strokeWidth={2}
							opacity={0}
							style={{
								transition: "all 0.2s ease",
								pointerEvents: "none",
							}}
							className="radial-option-hover"
						/>

						{/* Icon (simplified - in real implementation use SVG or emoji rendering) */}
						<text
							x={x}
							y={y}
							textAnchor="middle"
							dominantBaseline="central"
							fontSize={16}
							style={{ pointerEvents: "none", userSelect: "none" }}>
							{option.icon}
						</text>

						{/* Label on hover */}
						<g className="radial-option-label" opacity={0}>
							<rect
								x={x - 30}
								y={y + 28}
								width={60}
								height={20}
								rx={4}
								fill="rgba(15, 23, 36, 0.9)"
							/>
							<text
								x={x}
								y={y + 38}
								textAnchor="middle"
								dominantBaseline="central"
								fontSize={11}
								fill="#E6EEF8"
								style={{ pointerEvents: "none", userSelect: "none" }}>
								{option.label}
							</text>
						</g>
					</g>
				);
			})}

			{/* CSS for hover effects */}
			<style>{`
        g:hover .radial-option-hover {
          opacity: 1 !important;
        }
        g:hover .radial-option-label {
          opacity: 1 !important;
        }
      `}</style>
		</>
	);
}
