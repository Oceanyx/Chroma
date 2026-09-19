// src/utils/constants.js
//
// CANONICAL source for canvas/UI constants only.
//
// NOTE: Planet and moon sizing/orbit values live in seedData.js (planetConfig,
// moonConfig). Those objects are what the app actually reads. The old MOON and
// PLANET objects that used to live here had diverged from seedData.js and were
// never imported anywhere — removed to prevent future confusion.

export const CANVAS = {
	backgroundColor: "#080C18",
	gridSize: 40,
	gridOpacity: 0.6,
	defaultZoom: 0.9,
	defaultPan: { x: 0, y: 0 },
	minZoom: 0.3,
	maxZoom: 4,
};

export const REFLECTION_MODE = {
	targetZoom: 2.5,
	navbarHeight: 60,
};

export const CONNECTION = {
	strokeColor: "#4A5568",
	strokeColorHovered: "#A78BFA",
	strokeWidth: 2,
	strokeWidthHovered: 3,
	hitAreaWidth: 20, // invisible hit area for easier clicking
	dashArray: "8,6",
};

export const Z_INDEX = {
	canvas: 0,
	connections: 1,
	planets: 2,
	moons: 3,
	reflectionOverlay: 10,
	sidepanel: 20,
	topnav: 30,
	tooltip: 100,
};
