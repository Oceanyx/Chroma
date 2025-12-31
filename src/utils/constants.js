// src/utils/constants.js - Visual & Interaction Constants

// ============================================================================
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
  // Observation planets
  O: {
    radius: 50,
    colors: {
      core: ["#1E3A8A", "#1E40AF"], // Dark to medium blue
      surface: ["#3B82F6", "#60A5FA"], // Medium to light blue
      atmosphere: ["#60A5FA", "#93C5FD"], // Light to pale blue
      glow: "rgba(147, 197, 253, 0.4)", // Pale blue glow
    },
    highlightOffset: { x: -0.3, y: -0.3 }, // Top-left highlight
    glowRadius: 70,
    icon: "👁️",
    iconSize: 24,
  },

  // Action planets
  A: {
    radius: 50,
    colors: {
      core: ["#9A3412", "#C2410C"], // Dark to medium orange
      surface: ["#EA580C", "#FB923C"], // Medium to light orange
      atmosphere: ["#FB923C", "#FDBA74"], // Light to pale orange
      glow: "rgba(253, 186, 116, 0.4)", // Pale orange glow
    },
    highlightOffset: { x: -0.3, y: -0.3 },
    glowRadius: 70,
    icon: "⚡",
    iconSize: 24,

    // State-specific overlays
    states: {
      past: {
        trailColor: "rgba(100, 116, 139, 0.3)",
        trailLength: 30,
      },
      present: {
        pulseColor: "rgba(16, 185, 129, 0.5)",
        pulseSpeed: 2,
      },
      future: {
        glowColor: "rgba(59, 130, 246, 0.6)",
        glowIntensity: 1.3,
      },
    },
  },
};

// ============================================================================
// MOON SETTINGS
// ============================================================================
export const MOON = {
  radius: 18,
  orbitRadius: 90, // Distance from parent center
  orbitSpeed: 0.0005, // Radians per frame (very slow)

  // Domain colors
  domains: {
    private: {
      color: "#A78BFA",
      glow: "rgba(167, 139, 250, 0.5)",
      name: "Private",
    },
    public: {
      color: "#10B981",
      glow: "rgba(16, 185, 129, 0.5)",
      name: "Public",
    },
    abstract: {
      color: "#3B82F6",
      glow: "rgba(59, 130, 246, 0.5)",
      name: "Abstract",
    },
  },

  // Aggregation display
  aggregateIndicator: {
    radius: 8,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },

  // Ghost moons (selection state)
  ghost: {
    opacity: 0.3,
    hoverOpacity: 0.7,
    selectedOpacity: 1,
    fadeOutDuration: 300, // ms
  },
};

// ============================================================================
// REFLECTION MODE (ZOOM)
// ============================================================================
export const REFLECTION_MODE = {
  zoomLevel: 2.5,
  transitionDuration: 600, // ms
  backgroundDimming: 0.3, // Opacity of non-focused elements
  blurAmount: 8, // px

  // Ghost moon positions (angles in radians)
  ghostAngles: {
    private: Math.PI * 1.5, // Top (270°)
    public: Math.PI * 0.5, // Bottom (90°)
    abstract: 0, // Right (0°)
  },

  // Input card
  inputCard: {
    width: 320,
    offsetX: 40, // Distance from moon
    offsetY: -80,
    borderRadius: 12,
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderColor: "rgba(108, 99, 255, 0.3)",
  },
};

// ============================================================================
// CONNECTIONS (EDGES)
// ============================================================================
export const CONNECTION = {
  strokeWidth: 2,
  strokeWidthHover: 3,
  color: "rgba(148, 163, 184, 0.4)",
  colorHover: "rgba(255, 255, 255, 0.7)",
  arrowSize: 8,

  // Connection styles
  types: {
    causality: {
      stroke: "#6C63FF",
      dashArray: "none",
      arrow: true,
    },
    resonance: {
      stroke: "#10B981",
      dashArray: "5,5",
      arrow: false,
    },
    refinement: {
      stroke: "#F59E0B",
      dashArray: "none",
      arrow: true,
    },
  },
};

// ============================================================================
// PATTERN ZONES
// ============================================================================
export const PATTERN_ZONE = {
  minNodes: 3, // Min nodes to suggest pattern
  clusterRadius: 250, // Max distance for clustering
  blobPadding: 40, // Padding around nodes

  colors: {
    auto: "rgba(108, 99, 255, 0.08)",
    autoStroke: "rgba(108, 99, 255, 0.25)",
    custom: "rgba(16, 185, 129, 0.08)",
    customStroke: "rgba(16, 185, 129, 0.25)",
  },

  strokeWidth: 2,
  borderRadius: 20,
};

// ============================================================================
// INTERACTION
// ============================================================================
export const INTERACTION = {
  doubleClickDelay: 300, // ms
  dragThreshold: 5, // px
  hoverDelay: 200, // ms

  // Node selection
  selectionRing: {
    color: "#FFFFFF",
    width: 3,
    dashArray: "4,4",
    animationSpeed: 0.05,
  },
};

// ============================================================================
// ANIMATION EASING
// ============================================================================
export const EASING = {
  smooth: "cubic-bezier(0.4, 0.0, 0.2, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  sharp: "cubic-bezier(0.4, 0.0, 0.6, 1)",
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
};
