// src/utils/constants.js - V2 with 4 Dimensions

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
  O: {
    radius: 50,
    colors: {
      core: ["#1E3A8A", "#1E40AF"],
      surface: ["#3B82F6", "#60A5FA"],
      atmosphere: ["#60A5FA", "#93C5FD"],
      glow: "rgba(147, 197, 253, 0.4)",
    },
    highlightOffset: { x: -0.3, y: -0.3 },
    glowRadius: 70,
    icon: "👁️",
    iconSize: 24,
  },

  A: {
    radius: 50,
    colors: {
      core: ["#9A3412", "#C2410C"],
      surface: ["#EA580C", "#FB923C"],
      atmosphere: ["#FB923C", "#FDBA74"],
      glow: "rgba(253, 186, 116, 0.4)",
    },
    highlightOffset: { x: -0.3, y: -0.3 },
    glowRadius: 70,
    icon: "⚡",
    iconSize: 24,

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
// MOON SETTINGS - 4 DIMENSIONS (V2)
// ============================================================================
export const MOON = {
  dimensions: {
    subjective: {
      color: "#A78BFA",
      glow: "rgba(167, 139, 250, 0.5)",
      name: "Subjective",
      radius: 14,
      orbitRadius: 90,
    },
    intersubjective: {
      color: "#10B981",
      glow: "rgba(16, 185, 129, 0.5)",
      name: "Intersubjective",
      radius: 18,
      orbitRadius: 140,
    },
    behavioral: {
      color: "#F97316",
      glow: "rgba(249, 115, 22, 0.5)",
      name: "Behavioral",
      radius: 20,
      orbitRadius: 180,
    },
    symbolic: {
      color: "#3B82F6",
      glow: "rgba(59, 130, 246, 0.5)",
      name: "Symbolic",
      radius: 22,
      orbitRadius: 220,
    },
  },

  aggregateIndicator: {
    radius: 8,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },

  ghost: {
    opacity: 0.3,
    hoverOpacity: 0.7,
    selectedOpacity: 1,
    fadeOutDuration: 300,
  },
};

// ============================================================================
// REFLECTION MODE (ZOOM)
// ============================================================================
export const REFLECTION_MODE = {
  zoomLevel: 2.5,
  transitionDuration: 600,
  backgroundDimming: 0.3,
  blurAmount: 8,

  ghostAngles: {
    subjective: Math.PI * 1.5,
    intersubjective: Math.PI * 0.5,
    behavioral: 0,
    symbolic: Math.PI,
  },

  inputCard: {
    width: 320,
    offsetX: 40,
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

  types: {
    temporal: {
      stroke: "#94A3B8",
      dashArray: "none",
      arrow: true,
    },
    causal: {
      stroke: "#3B82F6",
      dashArray: "none",
      arrow: true,
    },
    associative: {
      stroke: "#94A3B8",
      dashArray: "6,4",
      arrow: false,
    },
    contradictory: {
      stroke: "#FB923C",
      dashArray: "none",
      arrow: true,
    },
  },
};

// ============================================================================
// PATTERN ZONES
// ============================================================================
export const PATTERN_ZONE = {
  minNodes: 3,
  clusterRadius: 250,
  blobPadding: 40,

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
  doubleClickDelay: 300,
  dragThreshold: 5,
  hoverDelay: 200,

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
