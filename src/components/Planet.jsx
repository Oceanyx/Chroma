// src/components/Planet.jsx - V5.0
// Changes from V4.3:
//   - Planet color is now permanently type-based (O/A/I/H), reading from the
//     shared nodeTypeColors in seedData.js. Previously, color switched to a
//     dimension-mix gradient as soon as a planet had ≥1 moon, which meant
//     type identity (the thing you actually need to recognize a planet by
//     at a glance) disappeared the moment you started reflecting on it.
//     Dimension color still lives on moons themselves, one level down.
import React from "react";
import { planetConfig, nodeTypeColors } from "../seedData";

// ============================================================================
// COLOR CALCULATION — Planet color is always type-based, never dimension-based
// ============================================================================
const FALLBACK_COLORS = {
	core: ["#475569", "#64748B"],
	surface: ["#64748B", "#94A3B8"],
	atmosphere: ["#94A3B8", "#CBD5E1"],
	glow: "rgba(148, 163, 184, 0.3)",
};

function calculatePlanetColor(moons, nodeType) {
	return nodeTypeColors[nodeType] || FALLBACK_COLORS;
}

function calculateSurfaceState(moons) {
	if (!moons || moons.length === 0) return "calm";

	const tensionCount = moons.reduce(
		(sum, moon) =>
			sum +
			(moon.relationships?.filter((r) => r.type === "tension").length || 0),
		0,
	);

	if (tensionCount === 0) return "calm";
	if (tensionCount <= 2) return "rippled";
	return "stormy";
}

// Ambient-only signal — no label attached, just a visual. True when this
// planet's reflections have, on average, been marked "Evolved" a couple of
// times over: this is something you keep coming back to and re-understanding.
// Deliberately not surfaced as a word anywhere ("energized", "turbulent" etc.
// were considered and dropped — a verdict in text boxes a moment in a way a
// wordless visual doesn't). Independent of surfaceState above, so a planet
// can be both stormy (lots of tension) and shimmering (lots of revision) —
// that's a true, useful combination, not a contradiction to resolve into one
// label.
const ENERGIZED_VERSION_RATIO = 2.5;

function calculateEnergized(moons) {
	if (!moons || moons.length === 0) return false;
	const totalVersions = moons.reduce(
		(sum, moon) => sum + (moon.versions?.length || 0),
		0,
	);
	return totalVersions / moons.length >= ENERGIZED_VERSION_RATIO;
}

// Map new state keys → the visual effect they should produce.
// Also handles legacy keys so old exported maps still render.
const STATE_EFFECT = {
	// New keys
	active: "pulse",
	integrated: "trail",
	revisiting: "glow",
	// Legacy keys (I-node temporal states, or pre-migration O/A nodes)
	present: "pulse",
	past: "trail",
	future: "glow",
	// H (hypothetical) node states
	open: "pulse",
	confirmed: "trail",
	dismissed: "glow",
};

// ============================================================================
// PLANET COMPONENT
// ============================================================================

export default function Planet({
	node,
	moons = [],
	isHovered,
	isSelected,
	isFocused,
	onClick,
	onDoubleClick,
	onMouseEnter,
	onMouseLeave,
	onMouseDown,
}) {
	const colors = calculatePlanetColor(moons, node.type);
	const surfaceState = calculateSurfaceState(moons);
	const isEnergized = calculateEnergized(moons);

	const { x, y } = node.position;
	const radius = planetConfig.baseRadius;
	const centerX = x + radius;
	const centerY = y + radius;

	const gradientId = `gradient-${node.id}`;
	const glowId = `glow-${node.id}`;
	const noiseId = `noise-${node.id}`;

	const effect = STATE_EFFECT[node.state] || null;
	const glowOpacity = isHovered ? 0.5 : 0.2;
	const glowRadius = isHovered
		? planetConfig.glowRadius * 1.2
		: planetConfig.glowRadius;

	// Visual colours per effect type
	const pulseColor =
		node.state === "active"
			? "rgba(251, 191, 36, 0.5)"
			: node.state === "present"
				? "rgba(16, 185, 129, 0.5)"
				: "rgba(16, 185, 129, 0.5)";

	const trailColor = "rgba(100, 116, 139, 0.3)";

	const glowColor =
		node.state === "revisiting"
			? "rgba(167, 139, 250, 0.5)"
			: node.state === "future"
				? "rgba(59, 130, 246, 0.6)"
				: "rgba(167, 139, 250, 0.5)";

	return (
		<g
			onClick={(e) => onClick?.(node, e)}
			onDoubleClick={(e) => onDoubleClick?.(node, e)}
			onMouseEnter={() => onMouseEnter?.(node)}
			onMouseLeave={() => onMouseLeave?.()}
			onMouseDown={(e) => onMouseDown?.(node, e)}
			style={{ cursor: "pointer" }}
			opacity={isFocused === false ? 0.3 : 1}>
			{/* Invisible larger hit target — the visible planet circle alone was
			    an unforgivingly small/precise click area, which is very likely
			    why connections "take a few tries" to register. This sits behind
			    the visible circle and only expands the clickable radius. */}
			<circle
				cx={centerX}
				cy={centerY}
				r={radius + 16}
				fill="transparent"
				stroke="none"
				style={{ pointerEvents: "all" }}
			/>
			<defs>
				<radialGradient id={gradientId}>
					<stop offset="0%" stopColor={colors.core[0]} />
					<stop offset="40%" stopColor={colors.core[1]} />
					<stop offset="70%" stopColor={colors.surface[0]} />
					<stop offset="100%" stopColor={colors.surface[1]} />
				</radialGradient>

				<filter id={noiseId}>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.02"
						numOctaves={2}
						result="noise"
					/>
					<feDiffuseLighting
						in="noise"
						lightingColor={colors.surface[1]}
						surfaceScale="2">
						<feDistantLight azimuth="45" elevation="60" />
					</feDiffuseLighting>
					<feComposite operator="in" in2="SourceGraphic" />
					<feBlend in2="SourceGraphic" mode="overlay" />
				</filter>

				<filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation={isHovered ? "8" : "5"} result="blur" />
					<feFlood floodColor={colors.glow} floodOpacity="1" />
					<feComposite in2="blur" operator="in" />
					<feMerge>
						<feMergeNode />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{/* Outer Glow Aura */}
			<circle
				cx={centerX}
				cy={centerY}
				r={glowRadius}
				fill={colors.glow}
				opacity={glowOpacity}
				filter={`url(#${glowId})`}
				style={{ transition: "opacity 0.3s ease, filter 0.3s ease" }}
			/>

			{/* State overlays */}
			{effect === "trail" && (
				<ellipse
					cx={centerX - 30}
					cy={centerY}
					rx={30}
					ry={radius * 0.5}
					fill={trailColor}
					opacity={0.4}
				/>
			)}

			{effect === "pulse" && (
				<circle
					cx={centerX}
					cy={centerY}
					r={radius + 8}
					fill="none"
					stroke={pulseColor}
					strokeWidth={3}
					opacity={0.7}>
					<animate
						attributeName="r"
						values={`${radius + 5};${radius + 12};${radius + 5}`}
						dur="2s"
						repeatCount="indefinite"
					/>
					<animate
						attributeName="opacity"
						values="0.7;0.3;0.7"
						dur="2s"
						repeatCount="indefinite"
					/>
				</circle>
			)}

			{effect === "glow" && (
				<circle
					cx={centerX}
					cy={centerY}
					r={glowRadius * 1.3}
					fill={glowColor}
					opacity={0.25}>
					<animate
						attributeName="opacity"
						values="0.15;0.35;0.15"
						dur="3s"
						repeatCount="indefinite"
					/>
				</circle>
			)}

			{/* Main Planet Body */}
			<circle
				cx={centerX}
				cy={centerY}
				r={radius}
				fill={`url(#${gradientId})`}
				stroke={isSelected ? "#FFFFFF" : "rgba(255,255,255,0.1)"}
				strokeWidth={isSelected ? 3 : 1}
				filter={`url(#${noiseId})`}
			/>

			{/* Atmosphere */}
			<circle
				cx={centerX}
				cy={centerY}
				r={radius}
				fill={colors.atmosphere[0]}
				opacity={0.15}
			/>

			{/* Highlights */}
			<ellipse
				cx={centerX + planetConfig.highlightOffset.x * radius}
				cy={centerY + planetConfig.highlightOffset.y * radius}
				rx={radius * 0.35}
				ry={radius * 0.25}
				fill="rgba(255,255,255,0.5)"
				opacity={0.7}
			/>
			<ellipse
				cx={centerX + planetConfig.highlightOffset.x * radius * 0.5}
				cy={centerY + planetConfig.highlightOffset.y * radius * 0.5}
				rx={radius * 0.2}
				ry={radius * 0.15}
				fill="rgba(255,255,255,0.3)"
				opacity={0.5}
			/>

			{/* Surface tension animation */}
			{surfaceState === "rippled" && (
				<circle
					cx={centerX}
					cy={centerY}
					r={radius + 3}
					fill="none"
					stroke={colors.surface[1]}
					strokeWidth={1}
					opacity={0.4}>
					<animate
						attributeName="r"
						values={`${radius + 2};${radius + 5};${radius + 2}`}
						dur="3s"
						repeatCount="indefinite"
					/>
					<animate
						attributeName="opacity"
						values="0.2;0.5;0.2"
						dur="3s"
						repeatCount="indefinite"
					/>
				</circle>
			)}
			{surfaceState === "stormy" && (
				<>
					<circle
						cx={centerX}
						cy={centerY}
						r={radius + 3}
						fill="none"
						stroke="#EF4444"
						strokeWidth={2}
						opacity={0.6}>
						<animate
							attributeName="r"
							values={`${radius + 2};${radius + 8};${radius + 2}`}
							dur="1.5s"
							repeatCount="indefinite"
						/>
						<animate
							attributeName="opacity"
							values="0.3;0.7;0.3"
							dur="1.5s"
							repeatCount="indefinite"
						/>
					</circle>
					<circle
						cx={centerX}
						cy={centerY}
						r={radius + 6}
						fill="none"
						stroke="#EF4444"
						strokeWidth={1}
						opacity={0.4}>
						<animate
							attributeName="r"
							values={`${radius + 4};${radius + 10};${radius + 4}`}
							dur="2s"
							repeatCount="indefinite"
						/>
						<animate
							attributeName="opacity"
							values="0.2;0.5;0.2"
							dur="2s"
							repeatCount="indefinite"
						/>
					</circle>
				</>
			)}

			{/* Ambient shimmer — this planet's reflections have been revised/
			    evolved on average ≥2.5 times each. No badge, no label, just
			    a soft twinkle near the rim; can appear alongside the tension
			    rings above, not instead of them. */}
			{isEnergized && (
				<g opacity={0.6}>
					{[0, 1, 2].map((i) => {
						const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
						const cx = centerX + Math.cos(angle) * (radius + 5);
						const cy = centerY + Math.sin(angle) * (radius + 5);
						return (
							<circle key={i} cx={cx} cy={cy} r={1.6} fill="#FDE68A">
								<animate
									attributeName="opacity"
									values="0;0.9;0"
									dur={`${2.6 + i * 0.4}s`}
									begin={`${i * 0.6}s`}
									repeatCount="indefinite"
								/>
							</circle>
						);
					})}
				</g>
			)}

			{/* Moon count badge */}
			{moons.length > 0 && (
				<g>
					<circle
						cx={centerX + radius * 0.7}
						cy={centerY + radius * 0.7}
						r={12}
						fill="rgba(15,23,36,0.95)"
						stroke={colors.glow}
						strokeWidth={2}
					/>
					<text
						x={centerX + radius * 0.7}
						y={centerY + radius * 0.7}
						textAnchor="middle"
						dominantBaseline="central"
						fontSize={10}
						fill="#E6EEF8"
						fontWeight="600"
						style={{ pointerEvents: "none", userSelect: "none" }}>
						{moons.length}
					</text>
				</g>
			)}

			{/* Title label — expands to show more on hover instead of also
			    popping up a separate, redundant tooltip box above the planet */}
			<text
				x={centerX}
				y={centerY + radius + 20}
				textAnchor="middle"
				fontSize={13}
				fill="#E6EEF8"
				fontWeight={500}
				opacity={0.9}
				style={{
					pointerEvents: "none",
					paintOrder: "stroke",
					stroke: "rgba(8,13,25,0.85)",
					strokeWidth: 4,
					strokeLinejoin: "round",
				}}>
				{node.text?.substring(0, isHovered ? 60 : 20) || "Untitled"}
				{node.text?.length > (isHovered ? 60 : 20) ? "..." : ""}
			</text>

			{/* Selection ring */}
			{isSelected && (
				<circle
					cx={centerX}
					cy={centerY}
					r={radius + 6}
					fill="none"
					stroke="#FFFFFF"
					strokeWidth={2}
					strokeDasharray="4,4"
					opacity={0.8}>
					<animateTransform
						attributeName="transform"
						type="rotate"
						from={`0 ${centerX} ${centerY}`}
						to={`360 ${centerX} ${centerY}`}
						dur="4s"
						repeatCount="indefinite"
					/>
				</circle>
			)}
		</g>
	);
}
