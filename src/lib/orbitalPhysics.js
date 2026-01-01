// src/lib/orbitalPhysics.js - Fixed for Continuous Animation
import { moonConfig, planetConfig } from "../seedData";

/**
 * Calculate orbital position for a moon around its parent planet
 */
export function calculateMoonPosition(parent, angle, domain = "private") {
  const domainConfig = moonConfig.domain[domain];
  const planetRadius = planetConfig.baseRadius;
  const centerX = parent.position.x + planetRadius;
  const centerY = parent.position.y + planetRadius;

  return {
    x: centerX + Math.cos(angle) * domainConfig.orbitRadius,
    y: centerY + Math.sin(angle) * domainConfig.orbitRadius,
  };
}

/**
 * Group moons by domain - returns domain info without cached positions
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
        baseAngle: domainAngles[domain], // Store base angle, not position
        isAggregate: moonsInDomain.length > 1,
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
    const position = calculateMoonPosition(parent, angle, moon.domain);

    return {
      ...moon,
      orbitAngle: angle,
      position,
    };
  });
}

/**
 * Calculate animated orbital position based on time and initial angle
 * NOW PROPERLY ANIMATED!
 */
export function calculateAnimatedOrbit(
  moon,
  parent,
  time,
  paused = false,
  domain = "private"
) {
  const domainConfig = moonConfig.domain[domain];
  const baseAngle = moon.orbitAngle || 0;

  // If paused (hovered), return static position
  if (paused) {
    return calculateMoonPosition(parent, baseAngle, domain);
  }

  // Animate with domain-specific speed
  const animatedAngle = baseAngle + time * domainConfig.orbitSpeed;
  return calculateMoonPosition(parent, animatedAngle, domain);
}

/**
 * Calculate animated position for aggregate moon (domain-specific)
 */
export function calculateAnimatedAggregatePosition(
  baseAngle,
  domain,
  parent,
  time,
  paused = false
) {
  const domainConfig = moonConfig.domain[domain];

  if (paused) {
    return calculateMoonPosition(parent, baseAngle, domain);
  }

  // Animate with domain-specific speed
  const animatedAngle = baseAngle + time * domainConfig.orbitSpeed;
  return calculateMoonPosition(parent, animatedAngle, domain);
}

/**
 * Get ghost moon positions for reflection mode
 * Fixed positions in viewport center
 */
export function getGhostMoonPositions(parent) {
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;

  // West, East, North positions
  return {
    private: {
      x: viewportCenterX,
      y: viewportCenterY - moonConfig.domain.private.orbitRadius,
    },
    public: {
      x: viewportCenterX - moonConfig.domain.public.orbitRadius,
      y: viewportCenterY,
    },
    abstract: {
      x: viewportCenterX + moonConfig.domain.abstract.orbitRadius,
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
      moon1.domain
    ),
    moon2Position: calculateMoonPosition(
      parent,
      midpointAngle + separation,
      moon2.domain
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

  const position = calculateMoonPosition(parent, angleToTarget, moon.domain);

  return {
    position,
    rotation: angleToTarget,
    isTidalLocked: true,
  };
}
