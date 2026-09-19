// src/utils/constellationConfig.js
// Single source of truth for constellation archetype data.
// Import from here in: SpaceCanvas, ConstellationNebula, PlanetSidePanel
// Never import these from SpaceCanvas — that causes circular dependencies.

export const CONSTELLATION_ARCHETYPES = {
	"": { label: "— none —", emoji: "" },
	"turning-point": { label: "Turning point", emoji: "🌀" },
	loop: { label: "Loop", emoji: "🔁" },
	avoidance: { label: "Avoidance", emoji: "🌫️" },
	breakthrough: { label: "Breakthrough", emoji: "⚡" },
	drift: { label: "Drift", emoji: "🌊" },
	awakening: { label: "Awakening", emoji: "✦" },
};
