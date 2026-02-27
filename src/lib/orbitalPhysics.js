// src/lib/orbitalPhysics.js - V4.1
// Changes from V4.0: "symbolic" renamed to "framing" throughout.
//   - groupMoonsByDimension: grouped keys + dimensionAngles
//   - getGhostMoonPositions: symbolic → framing key + position
//   - getOrbitalPaths: last orbital path entry
import { moonConfig, planetConfig } from "../seedData";

/**
 * Calculate orbital position for a moon around its parent planet
 */
export function calculateMoonPosition(
	parent,
	angle,
	dimension = "subjective",
	scale = 1.0,
) {
	const dimensionConfig = moonConfig.dimension[dimension];
	const planetRadius = planetConfig.baseRadius;
	const centerX = parent.position.x + planetRadius;
	const centerY = parent.position.y + planetRadius;

	const orbitRadius = dimensionConfig.orbitRadius * scale;

	return {
		x: centerX + Math.cos(angle) * orbitRadius,
		y: centerY + Math.sin(angle) * orbitRadius,
	};
}

/**
 * Group moons by dimension
 */
export function groupMoonsByDimension(moons, parent) {
	const grouped = {
		subjective: [],
		intersubjective: [],
		behavioral: [],
		framing: [],
	};

	moons.forEach((moon) => {
		// Support legacy "symbolic" moons that haven't been migrated yet
		const dim = moon.dimension === "symbolic" ? "framing" : moon.dimension;
		if (grouped[dim]) {
			grouped[dim].push(moon);
		}
	});

	const dimensionAngles = {
		subjective: Math.PI * 1.5,
		intersubjective: Math.PI * 0.5,
		behavioral: 0,
		framing: Math.PI,
	};

	const result = {};

	Object.keys(grouped).forEach((dimension) => {
		const moonsInDimension = grouped[dimension];
		if (moonsInDimension.length > 0) {
			result[dimension] = {
				moons: moonsInDimension,
				count: moonsInDimension.length,
				baseAngle: dimensionAngles[dimension],
				isAggregate: moonsInDimension.length > 1,
			};
		}
	});

	return result;
}

/**
 * Distribute moons evenly in circular orbit
 */
export function distributeMoonsEvenly(moons, parent) {
	const count = moons.length;
	if (count === 0) return [];

	const angleStep = (Math.PI * 2) / count;
	const startAngle = Math.PI * 1.5;

	return moons.map((moon, index) => {
		const angle = startAngle + angleStep * index;
		// Normalise legacy dimension key before passing down
		const dim = moon.dimension === "symbolic" ? "framing" : moon.dimension;
		const position = calculateMoonPosition(parent, angle, dim);

		return {
			...moon,
			orbitAngle: angle,
			position,
		};
	});
}

/**
 * Calculate animated orbital position based on time and initial angle
 */
export function calculateAnimatedOrbit(
	moon,
	parent,
	time,
	paused = false,
	dimension = "subjective",
	scale = 1.0,
) {
	const dim = dimension === "symbolic" ? "framing" : dimension;
	const dimensionConfig = moonConfig.dimension[dim];
	const baseAngle = moon.orbitAngle || 0;

	const animatedAngle = baseAngle + time * dimensionConfig.orbitSpeed;
	return calculateMoonPosition(parent, animatedAngle, dim, scale);
}

/**
 * Calculate animated position for aggregate moon
 */
export function calculateAnimatedAggregatePosition(
	baseAngle,
	dimension,
	parent,
	time,
	paused = false,
) {
	const dim = dimension === "symbolic" ? "framing" : dimension;
	const dimensionConfig = moonConfig.dimension[dim];

	if (paused) {
		return calculateMoonPosition(parent, baseAngle, dim);
	}

	const animatedAngle = baseAngle + time * dimensionConfig.orbitSpeed;
	return calculateMoonPosition(parent, animatedAngle, dim);
}

/**
 * Get ghost moon positions for reflection mode
 */
export function getGhostMoonPositions(parent) {
	const viewportCenterX = window.innerWidth / 2;
	const viewportCenterY = window.innerHeight / 2;

	return {
		subjective: {
			x: viewportCenterX,
			y: viewportCenterY - moonConfig.dimension.subjective.orbitRadius,
		},
		intersubjective: {
			x: viewportCenterX,
			y: viewportCenterY + moonConfig.dimension.intersubjective.orbitRadius,
		},
		behavioral: {
			x: viewportCenterX + moonConfig.dimension.behavioral.orbitRadius,
			y: viewportCenterY,
		},
		framing: {
			x: viewportCenterX - moonConfig.dimension.framing.orbitRadius,
			y: viewportCenterY,
		},
	};
}

/**
 * Binary Lock
 */
export function calculateBinaryLock(moon1, moon2, parent) {
	const midpointAngle = (moon1.orbitAngle + moon2.orbitAngle) / 2;
	const separation = Math.PI / 6;

	return {
		moon1Position: calculateMoonPosition(
			parent,
			midpointAngle - separation,
			moon1.dimension === "symbolic" ? "framing" : moon1.dimension,
		),
		moon2Position: calculateMoonPosition(
			parent,
			midpointAngle + separation,
			moon2.dimension === "symbolic" ? "framing" : moon2.dimension,
		),
		lockAngle: midpointAngle,
	};
}

/**
 * Tidal Lock
 */
export function calculateTidalLock(moon, parent, target) {
	const planetRadius = planetConfig.baseRadius;
	const parentCenter = {
		x: parent.position.x + planetRadius,
		y: parent.position.y + planetRadius,
	};

	const targetCenter = {
		x: target.position.x + planetRadius,
		y: target.position.y + planetRadius,
	};

	const dx = targetCenter.x - parentCenter.x;
	const dy = targetCenter.y - parentCenter.y;
	const angleToTarget = Math.atan2(dy, dx);

	const dim = moon.dimension === "symbolic" ? "framing" : moon.dimension;
	const position = calculateMoonPosition(parent, angleToTarget, dim);

	return {
		position,
		rotation: angleToTarget,
		isTidalLocked: true,
	};
}

/**
 * Get orbital paths for each dimension
 */
export function getOrbitalPaths(planet) {
	const centerX = planet.position.x + planetConfig.baseRadius;
	const centerY = planet.position.y + planetConfig.baseRadius;

	return [
		{
			dimension: "subjective",
			centerX,
			centerY,
			radius: moonConfig.dimension.subjective.orbitRadius,
			color: moonConfig.dimension.subjective.color,
		},
		{
			dimension: "behavioral",
			centerX,
			centerY,
			radius: moonConfig.dimension.behavioral.orbitRadius,
			color: moonConfig.dimension.behavioral.color,
		},
		{
			dimension: "intersubjective",
			centerX,
			centerY,
			radius: moonConfig.dimension.intersubjective.orbitRadius,
			color: moonConfig.dimension.intersubjective.color,
		},
		{
			dimension: "framing",
			centerX,
			centerY,
			radius: moonConfig.dimension.framing.orbitRadius,
			color: moonConfig.dimension.framing.color,
		},
	];
}

/**
 * Calculate smooth bezier curve for support relationship
 */
export function calculateSupportCurve(moonAPos, moonBPos) {
	const midX = (moonAPos.x + moonBPos.x) / 2;
	const midY = (moonAPos.y + moonBPos.y) / 2;

	const dx = moonBPos.x - moonAPos.x;
	const dy = moonBPos.y - moonAPos.y;
	const perpX = -dy * 0.15;
	const perpY = dx * 0.15;

	const controlX = midX + perpX;
	const controlY = midY + perpY;

	return {
		path: `M ${moonAPos.x} ${moonAPos.y} Q ${controlX} ${controlY} ${moonBPos.x} ${moonBPos.y}`,
		controlPoint: { x: controlX, y: controlY },
	};
}

/**
 * Calculate tension zigzag line
 */
export function calculateTensionLine(moonAPos, moonBPos, intensity = 2) {
	const dx = moonBPos.x - moonAPos.x;
	const dy = moonBPos.y - moonAPos.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance === 0) return { path: "", points: [] };

	const segments = 8;
	const points = [];

	for (let i = 0; i <= segments; i++) {
		const t = i / segments;
		const baseX = moonAPos.x + dx * t;
		const baseY = moonAPos.y + dy * t;

		const perpX = -dy / distance;
		const perpY = dx / distance;
		const offset = (i % 2 === 0 ? 1 : -1) * (6 + intensity * 2);

		points.push({
			x: baseX + perpX * offset,
			y: baseY + perpY * offset,
		});
	}

	const path =
		`M ${points[0].x} ${points[0].y} ` +
		points
			.slice(1)
			.map((p) => `L ${p.x} ${p.y}`)
			.join(" ");

	return { path, points };
}
