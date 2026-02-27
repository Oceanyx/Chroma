// seedData.js - V5.0
// Changes from V4.4:
//   - "symbolic" dimension renamed to "framing" throughout
//   - dimensionColors: symbolic → framing key
//   - moonConfig: symbolic → framing, updated name and description
//   - planetConfig.states: past/present/future → active/integrated/revisiting (O/A nodes)
//     Future kept for I (intention) nodes — handled in component
//   - lenses: 7 old → 5 new with full dimension-aware instruction matrix
//   - Seed moons updated to use "phenomenological" lens id
// ============================================================================
// DIMENSION COLORS
// ============================================================================
export const dimensionColors = {
	subjective: "#A78BFA", // Violet   — Inner Experience
	intersubjective: "#10B981", // Green    — External / Relational
	behavioral: "#F97316", // Orange   — Behavioral
	framing: "#3B82F6", // Blue     — Framing (was Symbolic)
};

// ============================================================================
// PLANET CONFIG
// ============================================================================
export const planetConfig = {
	baseRadius: 60,
	glowRadius: 70,
	highlightOffset: { x: -0.3, y: -0.3 },

	// States for O (observation) and A (action) nodes.
	// I (intention) nodes keep their own temporal labels — handled in PlanetSidePanel.
	states: {
		active: {
			label: "Active",
			description: "Still unresolved or shaping current behaviour",
			pulseColor: "rgba(251, 191, 36, 0.5)",
			pulseSpeed: 2,
			opacity: 1,
		},
		integrated: {
			label: "Integrated",
			description: "You've made sufficient sense of this",
			trailColor: "rgba(16, 185, 129, 0.3)",
			trailLength: 30,
			opacity: 0.85,
		},
		revisiting: {
			label: "Revisiting",
			description: "You thought you were done with this — but you're back",
			glowColor: "rgba(167, 139, 250, 0.5)",
			glowIntensity: 1.2,
			opacity: 1,
		},
	},

	// Kept for backward compat with intention nodes and any legacy renders
	legacyStates: {
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
// MOON CONFIG
// Orbit radii are raw values. Both SpaceCanvas and ReflectionSpace apply
// ORBIT_SCALE = 0.62 when rendering, so effective visual radii are:
//   subjective:      155 × 0.62 =  96px
//   behavioral:      245 × 0.62 = 152px
//   intersubjective: 355 × 0.62 = 220px
//   framing:         500 × 0.62 = 310px  (outermost)
// ============================================================================
export const moonConfig = {
	dimension: {
		subjective: {
			color: dimensionColors.subjective,
			name: "Inner Experience",
			radius: 16,
			orbitRadius: 155,
			orbitSpeed: 0.001047,
			description: "What did you feel, think, or sense internally?",
			unlockThreshold: 0,
		},
		behavioral: {
			color: dimensionColors.behavioral,
			name: "Behavioral",
			radius: 24,
			orbitRadius: 245,
			orbitSpeed: 0.00075,
			description: "What did you observably do or say?",
			unlockThreshold: 5,
		},
		intersubjective: {
			color: dimensionColors.intersubjective,
			name: "External",
			radius: 32,
			orbitRadius: 355,
			orbitSpeed: 0.000698,
			description:
				"What can be externally verified or observed in shared space?",
			unlockThreshold: 0,
		},
		framing: {
			color: dimensionColors.framing,
			name: "Framing",
			radius: 40,
			orbitRadius: 500,
			orbitSpeed: 0.000524,
			description:
				"What conceptual model or framework illuminates what was happening here?",
			unlockThreshold: 15,
		},
		// Legacy alias — keeps orbitalPhysics.js and any other unchanged file from crashing
		// during migration. Points to the same config as "framing".
		get symbolic() {
			return this.framing;
		},
	},
};

// ============================================================================
// LENSES — V2
//
// Five lenses, each with dimension-aware attentional instructions.
// The `instructions` object is keyed by dimension; its value becomes the
// placeholder text in MoonInputCard when that lens + dimension combination
// is selected. All 20 strings are defined here.
//
// Custom lenses (user-created) follow the same shape with a sparse
// `instructions` object — only dimensions the user defined prompts for.
// If a dimension key is absent, the fallback is: "Look from this angle: [label]"
// ============================================================================
export const lenses = [
	{
		id: "phenomenological",
		label: "Phenomenological",
		emoji: "🔍",
		color: "#A78BFA",
		instructions: {
			subjective:
				"What sensations, feelings, or impulses were present in your body and awareness?",
			behavioral:
				"What did you physically do — the concrete gestures, words, and movements, stripped of interpretation?",
			intersubjective:
				"What was observable in the shared space — what would a camera have captured?",
			framing:
				"What is the most direct, unmediated description of what this moment was?",
		},
	},
	{
		id: "relational",
		label: "Relational",
		emoji: "🫶",
		color: "#10B981",
		instructions: {
			subjective:
				"What did you feel in response to the other person — not what you thought about them, but what moved in you?",
			behavioral:
				"How did your behaviour shift in relation to the other person — what did you move toward or away from?",
			intersubjective:
				"What was happening between people — what was the texture of the relational field?",
			framing:
				"Through the lens of this relationship, what does this event reveal?",
		},
	},
	{
		id: "structural",
		label: "Structural",
		emoji: "⚙️",
		color: "#3B82F6",
		instructions: {
			subjective:
				"What systemic or environmental pressures were you feeling inside — what constraints shaped your inner state?",
			behavioral:
				"What structures, rules, or forces shaped what you were able to do?",
			intersubjective:
				"What power dynamics, institutional forces, or collective patterns were visible?",
			framing:
				"What structural or systemic model illuminates what was happening here?",
		},
	},
	{
		id: "temporal",
		label: "Temporal",
		emoji: "⏳",
		color: "#F59E0B",
		instructions: {
			subjective:
				"What were you carrying into this moment from before — what history was alive in you?",
			behavioral:
				"How did your action continue or break from patterns in how you've responded before?",
			intersubjective:
				"What sequence of events led here, and what does this moment seem to be leading toward?",
			framing:
				"What temporal pattern does this event appear to be an instance of?",
		},
	},
	{
		id: "symbolic",
		label: "Symbolic",
		emoji: "🌀",
		color: "#6366F1",
		instructions: {
			subjective:
				"What does this experience feel like it means — what image, metaphor, or association arises?",
			behavioral:
				"What does what you did feel like it expresses or enacts symbolically?",
			intersubjective:
				"What collective story or cultural pattern does this scene feel like it belongs to?",
			framing:
				"What deeper meaning or significance does this event carry beyond its literal content?",
		},
	},
];

// Lens id lookup map for fast access
export const lensById = Object.fromEntries(lenses.map((l) => [l.id, l]));

// ============================================================================
// ARCHETYPE CALCULATION SYSTEM
// ============================================================================
export const archetypeThresholds = {
	tensionForTurbulent: 2,
	wobbleRatioForTurbulent: 0.5,
	versionRatioForEnergized: 2.5,
};

export function calculateArchetype(node, moons) {
	if (!moons || moons.length === 0) return "neutral";

	const tensions = moons.filter((m) =>
		(m.relationships || []).some((r) => r.type === "tension"),
	).length;
	const wobbles = moons.filter((m) => m.confidence === "wobbly").length;
	const versions = moons.reduce((sum, m) => sum + (m.versions || []).length, 0);

	if (
		tensions >= archetypeThresholds.tensionForTurbulent ||
		(moons.length > 0 &&
			wobbles / moons.length >= archetypeThresholds.wobbleRatioForTurbulent)
	) {
		return "turbulent";
	}
	if (
		moons.length > 0 &&
		versions / moons.length >= archetypeThresholds.versionRatioForEnergized
	) {
		return "energized";
	}
	if (moons.length >= 6) return "complex";
	if (moons.length >= 3) return "developing";
	return "neutral";
}

// ============================================================================
// SEED DATA
// ============================================================================
export const seedNodes = [
	{
		id: "o-1",
		type: "O",
		text: "Noticed tension in morning standup meeting",
		timestamp: Date.now() - 86400000,
		state: "active",
		position: { x: 200, y: 300 },
		constellationIds: [],
	},
	{
		id: "a-1",
		type: "A",
		text: "Decided to address the tension directly",
		timestamp: Date.now() - 43200000,
		state: "integrated",
		position: { x: 500, y: 300 },
		constellationIds: [],
	},
	{
		id: "o-2",
		type: "O",
		text: "Team seemed relieved after conversation",
		timestamp: Date.now() - 21600000,
		state: "active",
		position: { x: 800, y: 300 },
		constellationIds: [],
	},
	{
		id: "r-1",
		type: "R",
		parentId: "o-1",
		dimension: "subjective",
		text: "I felt anxious about being confrontational",
		timestamp: Date.now() - 86400000,
		ownership: "asserted",
		isLocked: false,
		lensUsed: "phenomenological",
		lensesUsed: ["phenomenological"],
		claimType: "reporting",
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
		text: "The team dynamic was strained — roles unclear",
		timestamp: Date.now() - 86400000,
		ownership: "asserted",
		isLocked: false,
		lensUsed: "structural",
		lensesUsed: ["structural"],
		claimType: "reading",
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
		type: "followed",
		createdAt: Date.now() - 43200000,
	},
	{
		id: "e-2",
		sourceId: "a-1",
		targetId: "o-2",
		type: "caused",
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
