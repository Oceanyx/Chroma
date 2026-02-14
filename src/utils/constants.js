// src/utils/constants.js - V2.2 with 4 Dimensions

// ==================================================================
// CANVAS SETTINGS
// ============================================================================
export const CANVAS = {
	defaultZoom: 0.8,
	minZoom: 0.3,
	maxZoom: 3,
	defaultPan: { x: 400, y: 200 },
	gridSize: 20,
	gridOpacity: 0.5,
	backgroundColor: "#0F1724",
};

// ============================================================================
// PLANET SIZES & COLORS
// ============================================================================
export const PLANET = {
	O: {
		radius: 50,
		glowRadius: 70,
		icon: "👁️",
		iconSize: 24,
	},
	A: {
		radius: 50,
		glowRadius: 70,
		icon: "⚡",
		iconSize: 24,
	},
};

// ============================================================================
// MOON SETTINGS - 4 DIMENSIONS
// ============================================================================
export const MOON = {
	dimensions: {
		subjective: {
			color: "#A78BFA",
			glow: "rgba(167, 139, 250, 0.5)",
			name: "Inner Experience",
			radius: 16,
			orbitRadius: 90,
		},
		intersubjective: {
			color: "#10B981",
			glow: "rgba(16, 185, 129, 0.5)",
			name: "External",
			radius: 32,
			orbitRadius: 180,
		},
		behavioral: {
			color: "#F97316",
			glow: "rgba(249, 115, 22, 0.5)",
			name: "Behavioral",
			radius: 24,
			orbitRadius: 140,
		},
		symbolic: {
			color: "#3B82F6",
			glow: "rgba(59, 130, 246, 0.5)",
			name: "Symbolic",
			radius: 40,
			orbitRadius: 220,
		},
	},
};

// ============================================================================
// REFLECTION MODE
// ============================================================================
export const REFLECTION_MODE = {
	zoomLevel: 2.5,
	transitionDuration: 600,
	backgroundDimming: 0.3,
	blurAmount: 8,
};

// ============================================================================
// CONNECTIONS
// ============================================================================
export const CONNECTION = {
	strokeWidth: 2,
	strokeWidthHover: 3,
	color: "rgba(148, 163, 184, 0.4)",
	colorHover: "rgba(255, 255, 255, 0.7)",
	arrowSize: 8,

	types: {
		temporal: {
			stroke: "#94A3B8",
			dashArray: "4,4",
			arrow: false, // NO ARROW - auto-generated
		},
		causal: {
			stroke: "#E6EEF8",
			dashArray: "none",
			arrow: true,
		},
		"intention-action": {
			stroke: "#FBBF24",
			dashArray: "none",
			arrow: true,
		},
		"intention-pattern": {
			stroke: "#FBBF24",
			dashArray: "6,4",
			arrow: false,
		},
	},
};

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================
export const Z_INDEX = {
	background: 0,
	patternZones: 1,
	connections: 2,
	planets: 10,
	moons: 11,
	ui: 100,
	modal: 1000,
	radialMenu: 2000,
};
