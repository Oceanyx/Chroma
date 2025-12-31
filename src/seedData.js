// src/seedData.js - NEW MVP Schema

// ============================================================================
// DOMAIN COLORS (for R nodes only)
// ============================================================================
export const domainColors = {
  private: "#A78BFA", // Violet
  public: "#10B981", // Green
  abstract: "#3B82F6", // Blue
};

// ============================================================================
// LENSES - Interpretive Frameworks
// ============================================================================
export const lenses = [
  {
    id: "somatic",
    label: "Somatic",
    promptText: "What sensations are present in your body?",
    applicableTo: ["R", "A"],
    color: "#F59E0B",
  },
  {
    id: "empathy",
    label: "Empathy",
    promptText: "How might this feel from another perspective?",
    applicableTo: ["R", "A"],
    color: "#EC4899",
  },
  {
    id: "systems",
    label: "Systems",
    promptText: "What structures or incentives are at play?",
    applicableTo: ["R", "A"],
    color: "#6366F1",
  },
  {
    id: "temporal",
    label: "Temporal",
    promptText: "How does this pattern evolve over time?",
    applicableTo: ["R", "A"],
    color: "#8B5CF6",
  },
];

// ============================================================================
// ACTION STATES (temporal orientation)
// ============================================================================
export const actionStates = [
  { id: "past", label: "Past", color: "#64748B" },
  { id: "present", label: "Present", color: "#10B981" },
  { id: "future", label: "Future", color: "#3B82F6" },
];

// ============================================================================
// PLANET VISUAL CONSTANTS
// ============================================================================
export const planetConfig = {
  observation: {
    baseRadius: 40,
    colors: {
      core: "#1E3A8A", // Deep blue
      surface: "#3B82F6", // Bright blue
      atmosphere: "#60A5FA", // Light blue
      glow: "#93C5FD", // Pale blue
    },
    icon: "👁️",
  },
  action: {
    baseRadius: 40,
    colors: {
      core: "#9A3412", // Deep orange
      surface: "#EA580C", // Bright orange
      atmosphere: "#FB923C", // Light orange
      glow: "#FDBA74", // Pale orange
    },
    icon: "⚡",
  },
};

// ============================================================================
// MOON VISUAL CONSTANTS
// ============================================================================
export const moonConfig = {
  baseRadius: 16,
  orbitRadius: 80, // Distance from parent planet
  orbitSpeed: 0.001, // Radians per frame
  maxMoonsPerDomain: 10, // Limit before aggregation
  domain: {
    private: {
      color: domainColors.private,
      glowIntensity: 0.6,
    },
    public: {
      color: domainColors.public,
      glowIntensity: 0.6,
    },
    abstract: {
      color: domainColors.abstract,
      glowIntensity: 0.6,
    },
  },
};

// ============================================================================
// SEED DATA - Initial Nodes & Edges
// ============================================================================
export const seedNodes = [
  // Observation 1
  {
    id: "o-1",
    type: "O",
    text: "Noticed tension in morning standup meeting",
    timestamp: Date.now() - 86400000, // Yesterday
    position: { x: 200, y: 300 },
  },

  // Action 1
  {
    id: "a-1",
    type: "A",
    text: "Decided to address the tension directly with the team",
    timestamp: Date.now() - 43200000, // 12 hours ago
    state: "past",
    position: { x: 500, y: 300 },
  },

  // Observation 2
  {
    id: "o-2",
    type: "O",
    text: "Team seemed relieved after the conversation",
    timestamp: Date.now() - 21600000, // 6 hours ago
    position: { x: 800, y: 300 },
  },

  // Reflections on o-1 (Private, Public, Abstract)
  {
    id: "r-1",
    type: "R",
    parentId: "o-1",
    domain: "private",
    text: "I was feeling anxious about being seen as confrontational",
    lensesUsed: ["somatic", "empathy"],
    orbitAngle: 0, // Will be calculated dynamically
  },
  {
    id: "r-2",
    type: "R",
    parentId: "o-1",
    domain: "public",
    text: "The team dynamic was strained - roles unclear",
    lensesUsed: ["systems"],
    orbitAngle: 0,
  },
  {
    id: "r-3",
    type: "R",
    parentId: "o-1",
    domain: "abstract",
    text: "This mirrors a pattern of avoidance in group settings",
    lensesUsed: ["temporal"],
    orbitAngle: 0,
  },

  // Reflections on a-1
  {
    id: "r-4",
    type: "R",
    parentId: "a-1",
    domain: "private",
    text: "Proud of myself for speaking up despite discomfort",
    lensesUsed: ["somatic"],
    orbitAngle: 0,
  },
  {
    id: "r-5",
    type: "R",
    parentId: "a-1",
    domain: "public",
    text: "Team responded positively - trust increased",
    lensesUsed: ["empathy", "systems"],
    orbitAngle: 0,
  },
];

export const seedEdges = [
  {
    id: "e-1",
    sourceId: "o-1",
    targetId: "a-1",
    createdAt: Date.now() - 43200000,
  },
  {
    id: "e-2",
    sourceId: "a-1",
    targetId: "o-2",
    createdAt: Date.now() - 21600000,
  },
];

// ============================================================================
// PATTERN ZONE CONFIG
// ============================================================================
export const patternZoneConfig = {
  detectionThreshold: 3, // Min nodes to form a pattern
  clusterRadius: 200, // Max distance between connected nodes
  colors: {
    default: "rgba(108, 99, 255, 0.1)",
    highlighted: "rgba(108, 99, 255, 0.2)",
  },
  strokeWidth: 2,
  strokeColor: "rgba(108, 99, 255, 0.3)",
};
