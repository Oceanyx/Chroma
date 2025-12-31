// src/lib/orbitalPhysics.js - Moon Position & Orbit Calculations

import { MOON, PLANET } from "../utils/constants";

/**
 * Calculate orbital position for a moon around its parent planet
 * @param {Object} parent - Parent planet node { position: {x, y}, type }
 * @param {number} angle - Angle in radians (0 = right, π/2 = bottom, π = left, 3π/2 = top)
 * @param {number} radius - Orbital radius (default from constants)
 * @returns {Object} - {x, y} position
 */
export function calculateMoonPosition(
  parent,
  angle,
  radius = MOON.orbitRadius
) {
  const planetRadius = PLANET[parent.type]?.radius || 50;
  const centerX = parent.position.x + planetRadius;
  const centerY = parent.position.y + planetRadius;

  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
}

/**
 * Distribute moons evenly around orbit
 * @param {Array} moons - Array of moon nodes for a single parent
 * @param {Object} parent - Parent planet node
 * @returns {Array} - Moons with updated orbital positions
 */
export function distributeMoonsEvenly(moons, parent) {
  const count = moons.length;
  if (count === 0) return [];

  const angleStep = (Math.PI * 2) / count;

  return moons.map((moon, index) => {
    const angle = angleStep * index;
    const position = calculateMoonPosition(parent, angle);

    return {
      ...moon,
      orbitAngle: angle,
      position,
    };
  });
}

/**
 * Group moons by domain and calculate positions for aggregate display
 * @param {Array} moons - All moons for a parent
 * @param {Object} parent - Parent planet node
 * @returns {Object} - { private: {...}, public: {...}, abstract: {...} }
 */
export function groupMoonsByDomain(moons, parent) {
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

  // Calculate positions for each domain's aggregate moon
  const domainAngles = {
    private: Math.PI * 1.5, // Top
    public: Math.PI * 0.5, // Bottom
    abstract: 0, // Right
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

  return result;
}

/**
 * Expand aggregate moon into individual moons in a mini-orbit
 * @param {Array} moons - Moons in a single domain
 * @param {Object} aggregatePosition - Position of the aggregate moon
 * @param {number} miniOrbitRadius - Radius of mini-orbit
 * @returns {Array} - Moons with mini-orbit positions
 */
export function expandAggregateMoon(
  moons,
  aggregatePosition,
  miniOrbitRadius = 30
) {
  const count = moons.length;
  const angleStep = (Math.PI * 2) / count;

  return moons.map((moon, index) => {
    const angle = angleStep * index;
    return {
      ...moon,
      position: {
        x: aggregatePosition.x + Math.cos(angle) * miniOrbitRadius,
        y: aggregatePosition.y + Math.sin(angle) * miniOrbitRadius,
      },
      miniOrbitAngle: angle,
    };
  });
}

/**
 * Calculate animated orbital position based on time
 * @param {Object} moon - Moon node with orbitAngle
 * @param {Object} parent - Parent planet
 * @param {number} time - Current time in ms
 * @returns {Object} - {x, y} animated position
 */
export function calculateAnimatedOrbit(moon, parent, time) {
  const baseAngle = moon.orbitAngle || 0;
  const animatedAngle = baseAngle + time * MOON.orbitSpeed;

  return calculateMoonPosition(parent, animatedAngle);
}

/**
 * Check if two moons would overlap
 * @param {Object} pos1 - {x, y} position
 * @param {Object} pos2 - {x, y} position
 * @param {number} minDistance - Minimum allowed distance
 * @returns {boolean}
 */
export function moonsWouldOverlap(pos1, pos2, minDistance = MOON.radius * 3) {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < minDistance;
}

/**
 * Binary Lock: Two sibling moons lock distance and orbit together
 * @param {Object} moon1 - First moon
 * @param {Object} moon2 - Second moon
 * @param {Object} parent - Parent planet
 * @returns {Object} - { moon1Position, moon2Position, lockAngle }
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
 * @param {Object} moon - Moon node
 * @param {Object} parent - Parent planet
 * @param {Object} target - Target node the moon is connected to
 * @returns {Object} - {x, y, rotation} for tidal-locked moon
 */
export function calculateTidalLock(moon, parent, target) {
  const planetRadius = PLANET[parent.type]?.radius || 50;
  const parentCenter = {
    x: parent.position.x + planetRadius,
    y: parent.position.y + planetRadius,
  };

  const targetCenter = {
    x: target.position.x + (PLANET[target.type]?.radius || 50),
    y: target.position.y + (PLANET[target.type]?.radius || 50),
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

/**
 * Get ghost moon positions for reflection mode
 * @param {Object} parent - Parent planet
 * @returns {Object} - { private, public, abstract } with positions
 */
export function getGhostMoonPositions(parent) {
  return {
    private: calculateMoonPosition(parent, Math.PI * 1.5), // Top
    public: calculateMoonPosition(parent, Math.PI * 0.5), // Bottom
    abstract: calculateMoonPosition(parent, 0), // Right
  };
}
