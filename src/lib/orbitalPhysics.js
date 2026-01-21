// src/lib/orbitalPhysics.js - V2 with 4 Dimensions
import { moonConfig, planetConfig } from "../seedData";

/**
 * Calculate orbital position for a moon around its parent planet
 */
export function calculateMoonPosition(parent, angle, dimension = "subjective") {
  const dimensionConfig = moonConfig.dimension[dimension];
  const planetRadius = planetConfig.baseRadius;
  const centerX = parent.position.x + planetRadius;
  const centerY = parent.position.y + planetRadius;

  return {
    x: centerX + Math.cos(angle) * dimensionConfig.orbitRadius,
    y: centerY + Math.sin(angle) * dimensionConfig.orbitRadius,
  };
}

/**
 * Group moons by dimension - returns dimension info without cached positions
 */
export function groupMoonsByDimension(moons, parent) {
  const grouped = {
    subjective: [],
    intersubjective: [],
    behavioral: [],
    symbolic: [],
  };

  moons.forEach((moon) => {
    if (grouped[moon.dimension]) {
      grouped[moon.dimension].push(moon);
    }
  });

  // Fixed angles for each dimension
  const dimensionAngles = {
    subjective: Math.PI * 1.5, // Top (270°)
    intersubjective: Math.PI * 0.5, // Bottom (90°)
    behavioral: 0, // Right (0°)
    symbolic: Math.PI, // Left (180°)
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
    const position = calculateMoonPosition(parent, angle, moon.dimension);

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
  paused = false, // Kept for compatibility but not used
  dimension = "subjective",
) {
  const dimensionConfig = moonConfig.dimension[dimension];
  const baseAngle = moon.orbitAngle || 0;

  // Always calculate animated angle (pausing is handled at higher level)
  const animatedAngle = baseAngle + time * dimensionConfig.orbitSpeed;
  return calculateMoonPosition(parent, animatedAngle, dimension);
}

/**
 * Calculate animated position for aggregate moon (dimension-specific)
 */
export function calculateAnimatedAggregatePosition(
  baseAngle,
  dimension,
  parent,
  time,
  paused = false,
) {
  const dimensionConfig = moonConfig.dimension[dimension];

  if (paused) {
    return calculateMoonPosition(parent, baseAngle, dimension);
  }

  const animatedAngle = baseAngle + time * dimensionConfig.orbitSpeed;
  return calculateMoonPosition(parent, animatedAngle, dimension);
}

/**
 * Get ghost moon positions for reflection mode
 * Fixed positions in viewport center with 4 dimensions
 */
export function getGhostMoonPositions(parent) {
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;

  // Cardinal positions for 4 dimensions
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
    symbolic: {
      x: viewportCenterX - moonConfig.dimension.symbolic.orbitRadius,
      y: viewportCenterY,
    },
  };
}

/**
 * Binary Lock: Two sibling moons lock distance and orbit together
 */
export function calculateBinaryLock(moon1, moon2, parent) {
  const midpointAngle = (moon1.orbitAngle + moon2.orbitAngle) / 2;
  const separation = Math.PI / 6;

  return {
    moon1Position: calculateMoonPosition(
      parent,
      midpointAngle - separation,
      moon1.dimension,
    ),
    moon2Position: calculateMoonPosition(
      parent,
      midpointAngle + separation,
      moon2.dimension,
    ),
    lockAngle: midpointAngle,
  };
}

/**
 * Tidal Lock: Moon faces a distant target and stops orbiting
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

  const position = calculateMoonPosition(parent, angleToTarget, moon.dimension);

  return {
    position,
    rotation: angleToTarget,
    isTidalLocked: true,
  };
}

/**
 * Get orbital path circle data for rendering
 */
export function getOrbitalPaths(parent) {
  const planetRadius = planetConfig.baseRadius;
  const centerX = parent.position.x + planetRadius;
  const centerY = parent.position.y + planetRadius;

  return Object.entries(moonConfig.dimension).map(([key, config]) => ({
    dimension: key,
    centerX,
    centerY,
    radius: config.orbitRadius,
    color: config.color,
  }));
}
