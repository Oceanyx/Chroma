// src/lib/orbitalPhysics.js - With Stable Position Memoization
import { moonConfig, planetConfig } from "../seedData";

// Position cache to prevent recalculation
const positionCache = new Map();

/**
 * Calculate orbital position for a moon around its parent planet
 */
export function calculateMoonPosition(
  parent,
  angle,
  radius = moonConfig.orbitRadius
) {
  const planetRadius = planetConfig.baseRadius;
  const centerX = parent.position.x + planetRadius;
  const centerY = parent.position.y + planetRadius;

  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
}

/**
 * Group moons by domain and calculate stable positions
 * Returns memoized positions to prevent jittering
 */
export function groupMoonsByDomain(moons, parent) {
  const cacheKey = `${parent.id}-${moons.map((m) => m.id).join(",")}`;

  // Check cache
  if (positionCache.has(cacheKey)) {
    return positionCache.get(cacheKey);
  }

  const grouped = {
    private: [],
    public: [],
    abstract: [],
  };

  moons.forEach((moon) => {
    if (grouped[moon.domain]) {
      grouped[moon.domain].push(moon);
    }
  });

  // Fixed angles for each domain
  const domainAngles = {
    private: Math.PI * 1.5, // Top (270°)
    public: Math.PI * 0.5, // Bottom (90°)
    abstract: 0, // Right (0°)
  };

  const result = {};

  Object.keys(grouped).forEach((domain) => {
    const moonsInDomain = grouped[domain];
    if (moonsInDomain.length > 0) {
      result[domain] = {
        moons: moonsInDomain,
        count: moonsInDomain.length,
        position: calculateMoonPosition(parent, domainAngles[domain]),
        angle: domainAngles[domain],
        isAggregate: moonsInDomain.length > 1,
      };
    }
  });

  // Cache result
  positionCache.set(cacheKey, result);

  return result;
}

/**
 * Distribute moons evenly in circular orbit
 * Used for individual moon positioning when not aggregated
 */
export function distributeMoonsEvenly(moons, parent) {
  const count = moons.length;
  if (count === 0) return [];

  const angleStep = (Math.PI * 2) / count;
  const startAngle = Math.PI * 1.5; // Start from top

  return moons.map((moon, index) => {
    const angle = startAngle + angleStep * index;
    const position = calculateMoonPosition(parent, angle);

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
export function calculateAnimatedOrbit(moon, parent, time, paused = false) {
  const baseAngle = moon.orbitAngle || 0;

  // If paused (hovered), return static position
  if (paused) {
    return calculateMoonPosition(parent, baseAngle);
  }

  // Animate
  const animatedAngle = baseAngle + time * moonConfig.orbitSpeed;
  return calculateMoonPosition(parent, animatedAngle);
}

/**
 * Get ghost moon positions for reflection mode
 * These are fixed positions in viewport center
 */
export function getGhostMoonPositions(parent) {
  // In reflection mode, parent should be centered in viewport
  // Calculate based on viewport dimensions
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;

  const radius = moonConfig.orbitRadius;

  return {
    private: {
      x: viewportCenterX,
      y: viewportCenterY - radius,
    },
    public: {
      x: viewportCenterX,
      y: viewportCenterY + radius,
    },
    abstract: {
      x: viewportCenterX + radius,
      y: viewportCenterY,
    },
  };
}

/**
 * Clear position cache when nodes are added/removed
 */
export function clearPositionCache() {
  positionCache.clear();
}

/**
 * Binary Lock: Two sibling moons lock distance and orbit together
 */
export function calculateBinaryLock(moon1, moon2, parent) {
  const midpointAngle = (moon1.orbitAngle + moon2.orbitAngle) / 2;
  const separation = Math.PI / 6; // 30 degrees apart

  return {
    moon1Position: calculateMoonPosition(parent, midpointAngle - separation),
    moon2Position: calculateMoonPosition(parent, midpointAngle + separation),
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

  // Calculate angle from parent to target
  const dx = targetCenter.x - parentCenter.x;
  const dy = targetCenter.y - parentCenter.y;
  const angleToTarget = Math.atan2(dy, dx);

  // Position moon between parent and target
  const position = calculateMoonPosition(parent, angleToTarget);

  return {
    position,
    rotation: angleToTarget,
    isTidalLocked: true,
  };
}
