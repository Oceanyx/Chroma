// src/components/Moon.jsx - V3.0 High Contrast Distinctive Textures
import React from "react";
import { moonConfig } from "../seedData";

export default function Moon({
	node,
	position,
	count,
	isGhost = false,
	isHovered = false,
	onClick,
	onMouseEnter,
	onMouseLeave,
}) {
	const dimension = node.dimension;
	const config = moonConfig.dimension[dimension];

	if (!config) {
		console.error(`Unknown dimension: ${dimension}`);
		return null;
	}

	const radius = config.radius;
	const x = position?.x || node.position?.x || 0;
	const y = position?.y || node.position?.y || 0;

	const opacity = isGhost ? 0.3 : 1;
	const glowOpacity = isHovered ? 0.8 : isGhost ? 0.2 : 0.4;

	// Unique IDs
	const gradientId = `moon-gradient-${node.id}-${dimension}`;
	const glowId = `moon-glow-${node.id}`;
	const patternId = `moon-pattern-${node.id}`;
	const blurId = `blur-${node.id}`;

	return (
		<g
			onClick={(e) => {
				e.stopPropagation();
				onClick?.(node);
			}}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			style={{ cursor: "pointer" }}>
			<defs>
				{/* ========================================== */}
				{/* INNER EXPERIENCE (Violet) - Frosted Glass */}
				{/* ========================================== */}
				{dimension === "subjective" && (
					<>
						<radialGradient id={gradientId}>
							<stop offset="0%" stopColor="#C4B5FD" stopOpacity="1" />
							<stop offset="60%" stopColor="#A78BFA" stopOpacity="0.9" />
							<stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
						</radialGradient>
						<filter id={blurId}>
							<feGaussianBlur in="SourceGraphic" stdDeviation="2" />
						</filter>
					</>
				)}

				{/* ========================================== */}
				{/* BEHAVIORAL (Orange) - Crystalline Facets */}
				{/* ========================================== */}
				{dimension === "behavioral" && (
					<>
						<radialGradient id={gradientId}>
							<stop offset="0%" stopColor="#FDBA74" stopOpacity="1" />
							<stop offset="50%" stopColor="#FB923C" stopOpacity="1" />
							<stop offset="100%" stopColor="#EA580C" stopOpacity="0.9" />
						</radialGradient>
						{/* THICK diagonal crosshatch - much more visible */}
						<pattern
							id={patternId}
							width="10"
							height="10"
							patternUnits="userSpaceOnUse">
							{/* Diagonal lines going both ways */}
							<line
								x1="0"
								y1="0"
								x2="10"
								y2="10"
								stroke="#B45309"
								strokeWidth="2"
								opacity="0.7"
							/>
							<line
								x1="10"
								y1="0"
								x2="0"
								y2="10"
								stroke="#B45309"
								strokeWidth="2"
								opacity="0.7"
							/>
						</pattern>
					</>
				)}

				{/* ========================================== */}
				{/* EXTERNAL (Green) - Concentric Circles (Radar) */}
				{/* ========================================== */}
				{dimension === "intersubjective" && (
					<>
						<radialGradient id={gradientId}>
							<stop offset="0%" stopColor="#6EE7B7" stopOpacity="1" />
							<stop offset="60%" stopColor="#34D399" stopOpacity="0.95" />
							<stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
						</radialGradient>
						{/* Concentric circle pattern - like radar rings */}
						<pattern
							id={patternId}
							width="40"
							height="40"
							patternUnits="userSpaceOnUse">
							<circle
								cx="20"
								cy="20"
								r="5"
								fill="none"
								stroke="#047857"
								strokeWidth="1.5"
								opacity="0.6"
							/>
							<circle
								cx="20"
								cy="20"
								r="12"
								fill="none"
								stroke="#047857"
								strokeWidth="1.5"
								opacity="0.5"
							/>
							<circle
								cx="20"
								cy="20"
								r="19"
								fill="none"
								stroke="#047857"
								strokeWidth="1.5"
								opacity="0.4"
							/>
						</pattern>
					</>
				)}

				{/* ========================================== */}
				{/* SYMBOLIC (Blue) - Mandala Gradient */}
				{/* ========================================== */}
				{dimension === "symbolic" && (
					<radialGradient id={gradientId}>
						<stop offset="0%" stopColor="#93C5FD" stopOpacity="1" />
						<stop offset="60%" stopColor="#60A5FA" stopOpacity="0.95" />
						<stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
					</radialGradient>
				)}

				{/* Glow Filter */}
				<filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
					<feGaussianBlur stdDeviation={isHovered ? "5" : "3"} result="blur" />
					<feFlood floodColor={config.color} floodOpacity="1" />
					<feComposite in2="blur" operator="in" />
					<feMerge>
						<feMergeNode />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{/* Outer Glow */}
			<circle
				cx={x}
				cy={y}
				r={radius * 1.8}
				fill={config.color}
				opacity={glowOpacity}
				filter={`url(#${glowId})`}
				style={{ transition: "all 0.3s ease" }}
			/>

			{/* Main Moon Body */}
			<circle
				cx={x}
				cy={y}
				r={radius}
				fill={`url(#${gradientId})`}
				opacity={opacity}
				filter={dimension === "subjective" ? `url(#${blurId})` : undefined}
				style={{ transition: "all 0.2s ease" }}
			/>

			{/* ========================================== */}
			{/* DIMENSION-SPECIFIC TEXTURES & HIGHLIGHTS */}
			{/* ========================================== */}

			{/* INNER EXPERIENCE: Soft frosted overlay + gentle highlight */}
			{dimension === "subjective" && !isGhost && (
				<>
					{/* Frosted overlay */}
					<circle
						cx={x}
						cy={y}
						r={radius}
						fill="rgba(255, 255, 255, 0.2)"
						opacity={0.6}
						filter={`url(#${blurId})`}
					/>
					{/* Soft top-left shine */}
					<ellipse
						cx={x - radius * 0.25}
						cy={y - radius * 0.25}
						rx={radius * 0.4}
						ry={radius * 0.3}
						fill="rgba(255, 255, 255, 0.4)"
						opacity={0.8}
						filter={`url(#${blurId})`}
					/>
				</>
			)}

			{/* BEHAVIORAL: Sharp crosshatch + multiple crystal facets */}
			{dimension === "behavioral" && !isGhost && (
				<>
					{/* Crosshatch overlay - CLIPPED to moon */}
					<circle
						cx={x}
						cy={y}
						r={radius}
						fill={`url(#${patternId})`}
						style={{ mixBlendMode: "multiply" }}
					/>

					{/* Multiple sharp highlights (crystal facets) */}
					<ellipse
						cx={x - radius * 0.3}
						cy={y - radius * 0.3}
						rx={radius * 0.25}
						ry={radius * 0.2}
						fill="rgba(255, 255, 255, 0.6)"
						opacity={0.9}
					/>
					<ellipse
						cx={x + radius * 0.2}
						cy={y - radius * 0.15}
						rx={radius * 0.15}
						ry={radius * 0.1}
						fill="rgba(255, 255, 255, 0.5)"
						opacity={0.8}
					/>
					<ellipse
						cx={x - radius * 0.1}
						cy={y + radius * 0.2}
						rx={radius * 0.12}
						ry={radius * 0.08}
						fill="rgba(255, 255, 255, 0.4)"
						opacity={0.7}
					/>
				</>
			)}

			{/* EXTERNAL: Thick grid + technical highlight */}
			{dimension === "intersubjective" && !isGhost && (
				<>
					{/* Grid overlay with proper rotation */}
					<circle
						cx={x}
						cy={y}
						r={radius}
						fill={`url(#${patternId})`}
						style={{ mixBlendMode: "multiply" }}>
						{/* Rotation centered on moon position (x, y) */}
						<animateTransform
							attributeName="transform"
							type="rotate"
							from={`0 ${x} ${y}`}
							to={`360 ${x} ${y}`}
							dur="120s"
							repeatCount="indefinite"
						/>
					</circle>

					{/* Technical square highlight (not round) */}
					<rect
						x={x - radius * 0.35}
						y={y - radius * 0.35}
						width={radius * 0.5}
						height={radius * 0.5}
						fill="rgba(255, 255, 255, 0.3)"
						opacity={0.7}
						rx={2}
					/>
				</>
			)}

			{/* SYMBOLIC: Thick spokes + center glow */}
			{dimension === "symbolic" && !isGhost && (
				<>
					{/* Center glow */}
					<circle
						cx={x}
						cy={y}
						r={radius * 0.3}
						fill="rgba(255, 255, 255, 0.4)"
						opacity={0.8}
					/>

					{/* THICK mandala spokes (6 spokes) */}
					{[0, 60, 120, 180, 240, 300].map((angle) => {
						const rad = (angle * Math.PI) / 180;
						const x1 = x + Math.cos(rad) * (radius * 0.2);
						const y1 = y + Math.sin(rad) * (radius * 0.2);
						const x2 = x + Math.cos(rad) * (radius * 0.9);
						const y2 = y + Math.sin(rad) * (radius * 0.9);

						return (
							<line
								key={angle}
								x1={x1}
								y1={y1}
								x2={x2}
								y2={y2}
								stroke="rgba(255, 255, 255, 0.5)"
								strokeWidth="2.5"
								opacity={0.8}
							/>
						);
					})}

					{/* Top-left shine */}
					<ellipse
						cx={x - radius * 0.25}
						cy={y - radius * 0.25}
						rx={radius * 0.3}
						ry={radius * 0.25}
						fill="rgba(255, 255, 255, 0.4)"
						opacity={0.7}
					/>
				</>
			)}

			{/* ========================================== */}
			{/* ANIMATIONS */}
			{/* ========================================== */}

			{/* Inner Experience: Breathing Pulse */}
			{dimension === "subjective" && !isGhost && (
				<circle
					cx={x}
					cy={y}
					r={radius}
					fill="none"
					stroke={config.color}
					strokeWidth="2"
					opacity="0.5">
					<animate
						attributeName="r"
						values={`${radius * 0.9};${radius * 1.15};${radius * 0.9}`}
						dur="4s"
						repeatCount="indefinite"
					/>
					<animate
						attributeName="opacity"
						values="0.3;0.7;0.3"
						dur="4s"
						repeatCount="indefinite"
					/>
				</circle>
			)}

			{/* Symbolic: Cascading Point Pulse */}
			{dimension === "symbolic" && !isGhost && (
				<>
					{[0, 1, 2, 3, 4, 5].map((i) => {
						const angle = (i * 60 * Math.PI) / 180;
						const px = x + Math.cos(angle) * radius * 1.4;
						const py = y + Math.sin(angle) * radius * 1.4;

						return (
							<circle key={i} cx={px} cy={py} r="4" fill={config.color}>
								<animate
									attributeName="opacity"
									values="0;1;0"
									dur="3s"
									begin={`${i * 0.5}s`}
									repeatCount="indefinite"
								/>
								<animate
									attributeName="r"
									values="2;5;2"
									dur="3s"
									begin={`${i * 0.5}s`}
									repeatCount="indefinite"
								/>
							</circle>
						);
					})}
				</>
			)}

			{/* Aggregate Count Badge */}
			{count && count > 1 && (
				<g>
					<circle
						cx={x + radius * 0.7}
						cy={y - radius * 0.7}
						r={10}
						fill="rgba(15, 23, 36, 0.95)"
						stroke={config.color}
						strokeWidth={2}
					/>
					<text
						x={x + radius * 0.7}
						y={y - radius * 0.7}
						textAnchor="middle"
						dominantBaseline="central"
						fontSize={10}
						fontWeight="bold"
						fill="#E6EEF8"
						style={{ pointerEvents: "none", userSelect: "none" }}>
						{count}
					</text>
				</g>
			)}

			{/* Ghost Label */}
			{isGhost && (
				<text
					x={x}
					y={y + radius + 20}
					textAnchor="middle"
					fontSize={12}
					fill={config.color}
					opacity={0.7}
					fontWeight={600}
					style={{ pointerEvents: "none", textTransform: "capitalize" }}>
					{config.name}
				</text>
			)}

			{/* Hover Ring */}
			{isHovered && !isGhost && (
				<circle
					cx={x}
					cy={y}
					r={radius + 6}
					fill="none"
					stroke={config.color}
					strokeWidth={3}
					strokeDasharray="6,6"
					opacity={0.9}>
					<animate
						attributeName="stroke-dashoffset"
						from="0"
						to="24"
						dur="1.5s"
						repeatCount="indefinite"
					/>
				</circle>
			)}
		</g>
	);
}
