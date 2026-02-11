// src/seedData.js - V2.2 with Archetype Emergence & Corrected Dimension Names

// ============================================================================
// DIMENSION COLORS
// ============================================================================
export const dimensionColors = {
  subjective: "#A78BFA", // Violet (Inner Experience)
  intersubjective: "#10B981", // Green (External)
  behavioral: "#F97316", // Orange
  symbolic: "#3B82F6", // Blue
};

// ============================================================================
// PLANET VARIANTS (ARCHETYPES)
// ============================================================================
export const planetVariants = {
  observation: {
    neutral: {
      name: "Neutral",
      colors: {
        core: ["#475569", "#64748B"],
        surface: ["#64748B", "#94A3B8"],
        atmosphere: ["#94A3B8", "#CBD5E1"],
        glow: "rgba(148, 163, 184, 0.3)",
      },
    },
    calm: {
      name: "Calm",
      colors: {
        core: ["#BAE6FD", "#7DD3FC"],
        surface: ["#38BDF8", "#0EA5E9"],
        atmosphere: ["#7DD3FC", "#BAE6FD"],
        glow: "rgba(125, 211, 252, 0.4)",
      },
    },
    turbulent: {
      name: "Turbulent",
      colors: {
        core: ["#334155", "#475569"],
        surface: ["#64748B", "#475569"],
        atmosphere: ["#94A3B8", "#64748B"],
        glow: "rgba(100, 116, 139, 0.4)",
      },
    },
    energized: {
      name: "Energized",
      colors: {
        core: ["#0D9488", "#14B8A6"],
        surface: ["#2DD4BF", "#5EEAD4"],
        atmosphere: ["#5EEAD4", "#99F6E4"],
        glow: "rgba(94, 234, 212, 0.5)",
      },
    },
    "deep-ocean": {
      name: "Deep Ocean",
      colors: {
        core: ["#0C4A6E", "#075985"],
        surface: ["#0369A1", "#0284C7"],
        atmosphere: ["#0EA5E9", "#38BDF8"],
        glow: "rgba(56, 189, 248, 0.4)",
      },
    },
    "ice-crystal": {
      name: "Ice Crystal",
      colors: {
        core: ["#E0F2FE", "#BAE6FD"],
        surface: ["#7DD3FC", "#38BDF8"],
        atmosphere: ["#0EA5E9", "#7DD3FC"],
        glow: "rgba(125, 211, 252, 0.4)",
      },
    },
    twilight: {
      name: "Twilight",
      colors: {
        core: ["#4C1D95", "#5B21B6"],
        surface: ["#7C3AED", "#8B5CF6"],
        atmosphere: ["#A78BFA", "#C4B5FD"],
        glow: "rgba(167, 139, 250, 0.4)",
      },
    },
    "storm-cloud": {
      name: "Storm Cloud",
      colors: {
        core: ["#334155", "#475569"],
        surface: ["#64748B", "#94A3B8"],
        atmosphere: ["#CBD5E1", "#E2E8F0"],
        glow: "rgba(203, 213, 225, 0.4)",
      },
    },
    arctic: {
      name: "Arctic",
      colors: {
        core: ["#0F766E", "#0D9488"],
        surface: ["#14B8A6", "#2DD4BF"],
        atmosphere: ["#5EEAD4", "#99F6E4"],
        glow: "rgba(94, 234, 212, 0.4)",
      },
    },
    nebula: {
      name: "Nebula",
      colors: {
        core: ["#312E81", "#3730A3"],
        surface: ["#4F46E5", "#6366F1"],
        atmosphere: ["#818CF8", "#A5B4FC"],
        glow: "rgba(129, 140, 248, 0.4)",
      },
    },
    "frozen-lake": {
      name: "Frozen Lake",
      colors: {
        core: ["#164E63", "#155E75"],
        surface: ["#0891B2", "#06B6D4"],
        atmosphere: ["#22D3EE", "#67E8F9"],
        glow: "rgba(34, 211, 238, 0.4)",
      },
    },
    midnight: {
      name: "Midnight",
      colors: {
        core: ["#1E1B4B", "#312E81"],
        surface: ["#4338CA", "#4F46E5"],
        atmosphere: ["#6366F1", "#818CF8"],
        glow: "rgba(99, 102, 241, 0.4)",
      },
    },
    glacier: {
      name: "Glacier",
      colors: {
        core: ["#7DD3FC", "#BAE6FD"],
        surface: ["#E0F2FE", "#F0F9FF"],
        atmosphere: ["#F0F9FF", "#FFFFFF"],
        glow: "rgba(224, 242, 254, 0.5)",
      },
    },
    "deep-space": {
      name: "Deep Space",
      colors: {
        core: ["#020617", "#0F172A"],
        surface: ["#1E293B", "#334155"],
        atmosphere: ["#475569", "#64748B"],
        glow: "rgba(71, 85, 105, 0.4)",
      },
    },
  },
  action: {
    neutral: {
      name: "Neutral",
      colors: {
        core: ["#78350F", "#92400E"],
        surface: ["#B45309", "#D97706"],
        atmosphere: ["#F59E0B", "#FBBF24"],
        glow: "rgba(245, 158, 11, 0.3)",
      },
    },
    calm: {
      name: "Calm",
      colors: {
        core: ["#C2410C", "#EA580C"],
        surface: ["#FB923C", "#FDBA74"],
        atmosphere: ["#FED7AA", "#FFEDD5"],
        glow: "rgba(251, 146, 60, 0.4)",
      },
    },
    turbulent: {
      name: "Turbulent",
      colors: {
        core: ["#7F1D1D", "#991B1B"],
        surface: ["#DC2626", "#B91C1C"],
        atmosphere: ["#EF4444", "#F87171"],
        glow: "rgba(239, 68, 68, 0.4)",
      },
    },
    energized: {
      name: "Energized",
      colors: {
        core: ["#EA580C", "#F97316"],
        surface: ["#FB923C", "#FDBA74"],
        atmosphere: ["#FED7AA", "#FFEDD5"],
        glow: "rgba(253, 186, 116, 0.5)",
      },
    },
    "solar-flare": {
      name: "Solar Flare",
      colors: {
        core: ["#7F1D1D", "#991B1B"],
        surface: ["#DC2626", "#EF4444"],
        atmosphere: ["#F87171", "#FCA5A5"],
        glow: "rgba(248, 113, 113, 0.4)",
      },
    },
    ember: {
      name: "Ember",
      colors: {
        core: ["#7C2D12", "#9A3412"],
        surface: ["#C2410C", "#EA580C"],
        atmosphere: ["#F97316", "#FB923C"],
        glow: "rgba(249, 115, 22, 0.4)",
      },
    },
    sunset: {
      name: "Sunset",
      colors: {
        core: ["#B91C1C", "#DC2626"],
        surface: ["#F59E0B", "#F97316"],
        atmosphere: ["#FCD34D", "#FDE68A"],
        glow: "rgba(252, 211, 77, 0.4)",
      },
    },
    lava: {
      name: "Lava",
      colors: {
        core: ["#450A0A", "#7F1D1D"],
        surface: ["#B91C1C", "#DC2626"],
        atmosphere: ["#EF4444", "#F87171"],
        glow: "rgba(239, 68, 68, 0.4)",
      },
    },
    wildfire: {
      name: "Wildfire",
      colors: {
        core: ["#C2410C", "#EA580C"],
        surface: ["#F97316", "#FB923C"],
        atmosphere: ["#FDBA74", "#FED7AA"],
        glow: "rgba(253, 186, 116, 0.4)",
      },
    },
    phoenix: {
      name: "Phoenix",
      colors: {
        core: ["#881337", "#9F1239"],
        surface: ["#E11D48", "#F43F5E"],
        atmosphere: ["#FB7185", "#FDA4AF"],
        glow: "rgba(251, 113, 133, 0.4)",
      },
    },
    forge: {
      name: "Forge",
      colors: {
        core: ["#431407", "#7C2D12"],
        surface: ["#C2410C", "#EA580C"],
        atmosphere: ["#FB923C", "#FDBA74"],
        glow: "rgba(251, 146, 60, 0.4)",
      },
    },
    autumn: {
      name: "Autumn",
      colors: {
        core: ["#78350F", "#92400E"],
        surface: ["#B45309", "#D97706"],
        atmosphere: ["#F59E0B", "#FBBF24"],
        glow: "rgba(251, 191, 36, 0.4)",
      },
    },
    magma: {
      name: "Magma",
      colors: {
        core: ["#1C0A00", "#450A0A"],
        surface: ["#7F1D1D", "#991B1B"],
        atmosphere: ["#B91C1C", "#DC2626"],
        glow: "rgba(185, 28, 28, 0.4)",
      },
    },
    supernova: {
      name: "Supernova",
      colors: {
        core: ["#EF4444", "#F87171"],
        surface: ["#FCA5A5", "#FEE2E2"],
        atmosphere: ["#FEF2F2", "#FFFFFF"],
        glow: "rgba(254, 242, 242, 0.6)",
      },
    },
  },
};

export function getRandomVariant(nodeType) {
  const variantType = nodeType === "O" ? "observation" : "action";
  // Exclude archetype variants (neutral, calm, turbulent, energized) from random selection
  const decorativeVariants = Object.keys(planetVariants[variantType]).filter(
    (k) => !["neutral", "calm", "turbulent", "energized"].includes(k),
  );
  const randomKey =
    decorativeVariants[Math.floor(Math.random() * decorativeVariants.length)];
  return randomKey;
}

// ============================================================================
// PLANET CONFIG
// ============================================================================
export const planetConfig = {
  baseRadius: 50,
  glowRadius: 70,
  highlightOffset: { x: -0.3, y: -0.3 },

  states: {
    past: {
      trailColor: "rgba(100, 116, 139, 0.3)",
      trailLength: 30,
      opacity: 0.7,
    },
    present: {
      pulseColor: "rgba(16, 185, 129, 0.5)",
      pulseSpeed: 2,
      opacity: 1,
    },
    future: {
      glowColor: "rgba(59, 130, 246, 0.6)",
      glowIntensity: 1.3,
      opacity: 1,
    },
  },
};

// ============================================================================
// MOON CONFIG - 4 DIMENSIONS (V2.2)
// ============================================================================
export const moonConfig = {
  dimension: {
    subjective: {
      color: dimensionColors.subjective,
      name: "Inner Experience",
      radius: 16,
      orbitRadius: 90,
      orbitSpeed: 0.001047,
      description: "What did you feel, think, or sense internally?",
      unlockThreshold: 0, // Available from start
    },
    behavioral: {
      color: dimensionColors.behavioral,
      name: "Behavioral",
      radius: 24,
      orbitRadius: 140,
      orbitSpeed: 0.00075,
      description: "What did you observably do or say?",
      unlockThreshold: 5, // Unlocks after 5 reflections
    },
    intersubjective: {
      color: dimensionColors.intersubjective,
      name: "External",
      radius: 32,
      orbitRadius: 180,
      orbitSpeed: 0.000698,
      description: "What can be externally verified?",
      unlockThreshold: 0, // Available from start
    },
    symbolic: {
      color: dimensionColors.symbolic,
      name: "Symbolic",
      radius: 40,
      orbitRadius: 220,
      orbitSpeed: 0.000524,
      description: "What patterns or meanings do you recognize?",
      unlockThreshold: 15, // Unlocks after 15 reflections
    },
  },
};

// ============================================================================
// ARCHETYPE CALCULATION SYSTEM
// ============================================================================
export const archetypeThresholds = {
  tensionForTurbulent: 2, // 2+ tension relationships → turbulent
  wobbleRatioForTurbulent: 0.5, // 50%+ wobbly moons → turbulent
  versionRatioForEnergized: 2.5, // versions > moons × 2.5 → energized
};

export function calculateArchetype(node, moons) {
  if (!moons || moons.length === 0) {
    return "neutral"; // Default before any reflection
  }

  // Count tension relationships
  const tensionCount = moons.reduce(
    (sum, moon) =>
      sum +
      (moon.relationships?.filter((r) => r.type === "tension").length || 0),
    0,
  );

  // Count total versions across all moons
  const totalVersions = moons.reduce(
    (sum, moon) => sum + (moon.versions?.length || 1),
    0,
  );

  // Count wobbles (low confidence)
  const wobbleCount = moons.filter((m) => m.confidence === "wobbly").length;

  // Determine archetype
  if (
    tensionCount >= archetypeThresholds.tensionForTurbulent ||
    wobbleCount >= moons.length * archetypeThresholds.wobbleRatioForTurbulent
  ) {
    return "turbulent"; // High internal conflict or uncertainty
  } else if (
    totalVersions >
    moons.length * archetypeThresholds.versionRatioForEnergized
  ) {
    return "energized"; // Active editing/refinement
  } else {
    return "calm"; // Stable, coherent
  }
}

// ============================================================================
// LENSES
// ============================================================================
export const lenses = [
  {
    id: "psychological",
    label: "Psychological",
    emoji: "💭",
    color: "#EC4899",
    promptText: "What inner drives, fears, or wounds might be active here?",
  },
  {
    id: "somatic",
    label: "Somatic",
    emoji: "🫀",
    color: "#F59E0B",
    promptText: "What is my body telling me through sensations?",
  },
  {
    id: "aesthetic",
    label: "Aesthetic",
    emoji: "🎨",
    color: "#8B5CF6",
    promptText: "What is the felt quality or texture of this moment?",
  },
  {
    id: "empathy",
    label: "Empathy",
    emoji: "🫶",
    color: "#10B981",
    promptText: "How might this feel from someone else's perspective?",
  },
  {
    id: "systems",
    label: "Systems",
    emoji: "⚙️",
    color: "#3B82F6",
    promptText: "What structures or incentives shape this situation?",
  },
  {
    id: "existential",
    label: "Existential",
    emoji: "🌌",
    color: "#6366F1",
    promptText: "What does this mean in context of mortality and freedom?",
  },
  {
    id: "mythic",
    label: "Mythic",
    emoji: "📖",
    color: "#EF4444",
    promptText: "What archetypal pattern is playing out here?",
  },
];

// ============================================================================
// SEED DATA
// ============================================================================
export const seedNodes = [
  {
    id: "o-1",
    type: "O",
    text: "Noticed tension in morning standup meeting",
    timestamp: Date.now() - 86400000,
    state: "past",
    variant: "deep-ocean",
    archetype: "neutral", // Starts neutral
    position: { x: 200, y: 300 },
  },
  {
    id: "a-1",
    type: "A",
    text: "Decided to address the tension directly",
    timestamp: Date.now() - 43200000,
    state: "past",
    variant: "ember",
    archetype: "neutral", // Starts neutral
    position: { x: 500, y: 300 },
  },
  {
    id: "o-2",
    type: "O",
    text: "Team seemed relieved after conversation",
    timestamp: Date.now() - 21600000,
    state: "present",
    variant: "ice-crystal",
    archetype: "calm", // Has reflections, calculated as calm
    position: { x: 800, y: 300 },
  },
  {
    id: "r-1",
    type: "R",
    parentId: "o-1",
    dimension: "subjective",
    text: "I felt anxious about being confrontational",
    lensesUsed: ["somatic", "empathy"],
    orbitAngle: 0,
    confidence: "stable",
    intensity: "medium",
    temporality: "concurrent",
    versions: [],
    relationships: [],
  },
  {
    id: "r-2",
    type: "R",
    parentId: "o-1",
    dimension: "intersubjective",
    text: "The team dynamic was strained - roles unclear",
    lensesUsed: ["systems"],
    orbitAngle: 0,
    confidence: "stable",
    intensity: "medium",
    temporality: "concurrent",
    versions: [],
    relationships: [],
  },
];

export const seedEdges = [
  {
    id: "e-1",
    sourceId: "o-1",
    targetId: "a-1",
    type: "temporal",
    createdAt: Date.now() - 43200000,
  },
  {
    id: "e-2",
    sourceId: "a-1",
    targetId: "o-2",
    type: "temporal",
    createdAt: Date.now() - 21600000,
  },
];

export const patternZoneConfig = {
  detectionThreshold: 3,
  clusterRadius: 200,
  colors: {
    default: "rgba(108, 99, 255, 0.1)",
    highlighted: "rgba(108, 99, 255, 0.2)",
  },
  strokeWidth: 2,
  strokeColor: "rgba(108, 99, 255, 0.3)",
};
