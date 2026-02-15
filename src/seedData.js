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
// PLANET CONFIG
// ============================================================================
export const planetConfig = {
	baseRadius: 60,
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
			orbitRadius: 100,
			orbitSpeed: 0.001047,
			description: "What did you feel, think, or sense internally?",
			unlockThreshold: 0, // Available from start
		},
		behavioral: {
			color: dimensionColors.behavioral,
			name: "Behavioral",
			radius: 24,
			orbitRadius: 145,
			orbitSpeed: 0.00075,
			description: "What did you observably do or say?",
			unlockThreshold: 5, // Unlocks after 5 reflections
		},
		intersubjective: {
			color: dimensionColors.intersubjective,
			name: "External",
			radius: 32,
			orbitRadius: 190,
			orbitSpeed: 0.000698,
			description: "What can be externally verified?",
			unlockThreshold: 0, // Available from start
		},
		symbolic: {
			color: dimensionColors.symbolic,
			name: "Symbolic",
			radius: 40,
			orbitRadius: 240,
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
		position: { x: 200, y: 300 },
	},
	{
		id: "a-1",
		type: "A",
		text: "Decided to address the tension directly",
		timestamp: Date.now() - 43200000,
		state: "past",
		position: { x: 500, y: 300 },
	},
	{
		id: "o-2",
		type: "O",
		text: "Team seemed relieved after conversation",
		timestamp: Date.now() - 21600000,
		state: "present",
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
