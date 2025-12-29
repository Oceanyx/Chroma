// src/seedData.js

export const domainColors = {
  private: "#FFB84D",
  public: "#4D9FFF",
  abstract: "#6EE7B7",
};

export const defaultLenses = [
  {
    id: "psychological",
    name: "Psychological",
    color: "#EC4899",
    questions: [
      "What inner drives, fears, or wounds might be active here?",
      "What ego patterns or habits am I noticing in myself?",
    ],
  },
  {
    id: "somatic",
    name: "Somatic",
    color: "#F59E0B",
    questions: [
      "What is my body telling me through sensations or tension?",
      "Where do I feel this physically, and what energy is present?",
    ],
  },
  {
    id: "aesthetic",
    name: "Aesthetic",
    color: "#8B5CF6",
    questions: [
      "What is the felt quality, vibe, or texture of this moment?",
      "What beauty or symbolic meaning do I perceive here?",
    ],
  },
  {
    id: "empathy",
    name: "Empathy",
    color: "#10B981",
    questions: [
      "How might this feel from someone else's inner world?",
      "What might they be needing or experiencing right now?",
    ],
  },
  {
    id: "systems",
    name: "Systems",
    color: "#3B82F6",
    questions: [
      "What structures, incentives, or constraints shape this situation?",
      "How do the parts of this system influence each other?",
    ],
  },
  {
    id: "existential",
    name: "Existential",
    color: "#6366F1",
    questions: [
      "What does this mean in the context of mortality and freedom?",
      "Why does this matter, or what makes it significant?",
    ],
  },
  {
    id: "mythic",
    name: "Mythic",
    color: "#EF4444",
    questions: [
      "What archetypal pattern or story is playing out here?",
      "What role am I embodying (Hero, Shadow, Creator, Outsider)?",
    ],
  },
];

// Pattern types for nodes
export const patternTypes = [
  {
    id: "trigger",
    name: "Trigger",
    description: "Initial activation or stimulus",
  },
  { id: "loop", name: "Loop", description: "Recurring pattern or cycle" },
  { id: "reframe", name: "Reframe", description: "Shift in perspective" },
  { id: "insight", name: "Insight", description: "New understanding" },
  { id: "conflict", name: "Conflict", description: "Tension or contradiction" },
  {
    id: "resolution",
    name: "Resolution",
    description: "Integration or settling",
  },
];

// Expanded Agency orientation states with descriptions
export const agencyStates = [
  {
    id: "resourced",
    name: "Resourced",
    description: "I have capacity and clarity; can act from choice",
  },
  {
    id: "curious",
    name: "Curious",
    description: "Exploring possibilities, hypotheses, surprises",
  },
  {
    id: "reflective",
    name: "Reflective",
    description: "Observing without immediate action; note-making mode",
  },
  {
    id: "protective",
    name: "Protective",
    description: "Guarding territory or boundaries; conserving resources",
  },
  {
    id: "reactive",
    name: "Reactive",
    description: "Immediate emotional activation; short-circuit responses",
  },
  {
    id: "detached",
    name: "Detached",
    description: "Distanced, analyzing from outside the scene",
  },
  {
    id: "collaborative",
    name: "Collaborative",
    description: "Looking to connect or co-create with others",
  },
];

/**
 * Meta-pattern library with diagnostic ↔ strength framing pairs
 * Organized into silent groups for the diagnostic view
 */
export const metaPatternLibrary = {
  internal: [
    { diagnostic: "Over-analysis", strength: "Sense-making drive" },
    { diagnostic: "Rumination spiral", strength: "Deep rehearsal tendency" },
    { diagnostic: "Self-abandonment", strength: "Other-attunement" },
    { diagnostic: "Harsh inner critic", strength: "High standards holder" },
    {
      diagnostic: "Perfectionistic tightening",
      strength: "Quality calibration",
    },
    { diagnostic: "Collapse response", strength: "Energy conservation" },
    {
      diagnostic: "Freeze–dissociation arc",
      strength: "Protective distancing",
    },
    { diagnostic: "Identity fusion", strength: "Deep commitment" },
    {
      diagnostic: "Hypervigilant scanning",
      strength: "Environmental awareness",
    },
  ],
  relational: [
    { diagnostic: "Belonging loop", strength: "Relational calibration" },
    { diagnostic: "Approval seeking", strength: "Connection-building" },
    { diagnostic: "Conflict avoidance", strength: "Harmony preservation" },
    {
      diagnostic: "Pursuer–withdrawer",
      strength: "Activation-approach dynamics",
    },
    { diagnostic: "Control loop", strength: "Reliability-seeking" },
    { diagnostic: "Projection loop", strength: "Pattern recognition" },
    { diagnostic: "Deference pattern", strength: "Respectful yielding" },
    { diagnostic: "Role-locking", strength: "Consistency provision" },
    { diagnostic: "Persona conflict", strength: "Identity flexibility" },
  ],
  meaningMaking: [
    { diagnostic: "Narrative inflation", strength: "Meaning-making depth" },
    { diagnostic: "Grand pattern projection", strength: "Systems thinking" },
    { diagnostic: "Hyper-interpretation", strength: "Nuance sensitivity" },
    { diagnostic: "Epistemic spiraling", strength: "Intellectual rigor" },
    { diagnostic: "Intuition override", strength: "Rational calibration" },
    { diagnostic: "Story reification", strength: "Narrative coherence" },
  ],
  temporal: [
    { diagnostic: "Old-script reactivation", strength: "Memory integration" },
    {
      diagnostic: "Repetition compulsion",
      strength: "Pattern completion drive",
    },
    {
      diagnostic: "Inner child protector conflict",
      strength: "Parts awareness",
    },
    { diagnostic: "Later insight reframing", strength: "Growth recognition" },
    { diagnostic: "Scene re-entry loop", strength: "Processing persistence" },
  ],
};

// Category metadata for diagnostic view
export const metaPatternCategories = [
  {
    id: "internal",
    name: "Internal Loops",
    description: "Patterns within your own mind and body",
  },
  {
    id: "relational",
    name: "Relational Loops",
    description: "Patterns in how you relate to others",
  },
  {
    id: "meaningMaking",
    name: "Meaning-Making Loops",
    description: "Patterns in how you interpret and understand",
  },
  {
    id: "temporal",
    name: "Temporal Loops",
    description: "Patterns across time and development",
  },
];

// Helper to get all tags with their framings
export const getMetaTagWithFraming = (tag) => {
  for (const group of Object.values(metaPatternLibrary)) {
    for (const item of group) {
      if (item.diagnostic === tag)
        return { tag, framing: "diagnostic", alt: item.strength };
      if (item.strength === tag)
        return { tag, framing: "strength", alt: item.diagnostic };
    }
  }
  return { tag, framing: "neutral", alt: null };
};

// Flattened predefined list (diagnostic tags for backwards compatibility)
export const predefinedMetaTags = Object.values(metaPatternLibrary)
  .flat()
  .map((item) => item.diagnostic);

// All strength-framed tags
export const strengthMetaTags = Object.values(metaPatternLibrary)
  .flat()
  .map((item) => item.strength);

// Light-weight semantic hints to map keywords -> likely tags for suggestions
export const metaPatternHints = [
  {
    tag: "Perfectionistic tightening",
    keywords: ["tight", "perfection", "perfect", "pressure"],
  },
  {
    tag: "Control loop",
    keywords: ["control", "control loop", "controlling", "manage"],
  },
  {
    tag: "Over-analysis",
    keywords: ["over-analy", "overanalysis", "rumin", "think"],
  },
  {
    tag: "Belonging loop",
    keywords: ["belong", "fit in", "accepted", "approval"],
  },
  { tag: "Approval seeking", keywords: ["approval", "praise", "validation"] },
  {
    tag: "Rumination spiral",
    keywords: ["replay", "replaying", "ruminat", "can't stop thinking"],
  },
  {
    tag: "Identity fusion",
    keywords: ["identity", "who am i", "fused", "self"],
  },
  {
    tag: "Projection loop",
    keywords: ["project", "projecting", "assume", "assumption"],
  },
  {
    tag: "Hyper-interpretation",
    keywords: ["interpret", "meaning", "read into", "over-interpret"],
  },
  {
    tag: "Narrative inflation",
    keywords: ["story", "narrative", "grand pattern", "meaning inflation"],
  },
  {
    tag: "Repetition compulsion",
    keywords: ["repeat", "repeating", "again", "pattern repeats"],
  },
  {
    tag: "Freeze–dissociation arc",
    keywords: ["dissoc", "dissociated", "space out", "freeze"],
  },
  {
    tag: "Pursuer–withdrawer",
    keywords: ["pursuer", "withdraw", "avoid", "chase"],
  },
  {
    tag: "Scene re-entry loop",
    keywords: ["re-entry", "re-enter", "scenario replay", "imagine again"],
  },
];

// Mode definitions
export const modes = [
  {
    id: "field-first",
    name: "Field-first",
    description: "Sensing the relational or energetic field",
  },
  {
    id: "concept-first",
    name: "Concept-first",
    description: "Interpreting via frameworks",
  },
  {
    id: "social-first",
    name: "Social-first",
    description: "Attuning to others' reactions",
  },
  {
    id: "narrative-first",
    name: "Narrative-first",
    description: "Understanding through story and meaning",
  },
];

// Domain question banks (Quick, Deep, Experiments)
export const domainQuestionBanks = {
  private: {
    quick: [
      "What am I noticing inside my body and mind right now?",
      "What immediate impulse or urge is present?",
    ],
    deep: [
      "Which part of me is speaking? (critic, protector, child, strategist, etc.)",
      "What core need or value is activated here? (belonging, competence, safety, autonomy)",
      "Where in my timeline does this pattern first show up?",
      "What assumptions am I making about myself or others right now?",
      "How does this pattern affect my breathing, posture, attention?",
      "What stories am I telling that amplify or soothe this feeling?",
      "Does this pattern help me in some contexts? When is it useful?",
      "What would curiosity look like here? What would compassion look like?",
    ],
    experiments: [
      "Try a 3-minute body scan and record what shifts.",
      "Name the protective voice for 1 minute: what does it want?",
      "Pause before responding — note the urge and wait 60 seconds; then act.",
    ],
  },
  public: {
    quick: [
      "What behavior or event triggered this perception?",
      "Who else is involved and what might they be feeling?",
    ],
    deep: [
      "What roles are people playing right now (caretaker, evaluator, challenger)?",
      "What power dynamics or incentives are shaping behavior here?",
      "What communication cues were present (tone, timing, framing, silence)?",
      "What could I be assuming about others' intentions?",
      "How does the social context reward or punish this behavior?",
      "If I framed this as a systems issue, what part is most active?",
      "What patterns recur across different relationships or settings?",
      "What small boundary, request, or experiment could clarify things?",
    ],
    experiments: [
      "Ask a clarifying question in the next conversation and record the response.",
      "Test a micro-behavior change for one day (e.g., shorter responses, offer a boundary).",
      "Draft a 1-paragraph hypothesis of the other person's perspective and check it.",
    ],
  },
  abstract: {
    quick: [
      "Which conceptual lens is most active right now? (psych, systemic, moral, narrative)",
      "Is this primarily a model I'm applying, or a felt reality?",
    ],
    deep: [
      "What assumptions does this framework require to be true?",
      "Which data points support this model, and which contradict it?",
      "What alternative frameworks might explain the same facts?",
      "Where does this interpretation create blind spots or moral risks?",
      "How does this frame prioritize certain values over others?",
      "Is this an analytic move to feel control, or a generous attempt to explain?",
      "What would a counterfactual look like (if the model were wrong)?",
      "If I hold this as a working hypothesis, what evidence would change my mind?",
    ],
    experiments: [
      "Map 2 alternative models side-by-side and list what each predicts differently.",
      "Run a 'what-if' thought experiment — assume the opposite and journal 5 consequences.",
      "Try a single reductionist metric or an embodied practice to test a conceptual prediction.",
    ],
  },
};

// Connection types with visual styling
export const connectionTypes = [
  {
    id: "influences",
    name: "Influences",
    description: "Causal or directional impact",
    color: "#6C63FF",
    strokeDasharray: "none",
    arrow: true,
  },
  {
    id: "mirrors",
    name: "Mirrors",
    description: "Parallel or reflected pattern",
    color: "#10B981",
    strokeDasharray: "5,5",
    arrow: false,
  },
  {
    id: "contradicts",
    name: "Contradicts",
    description: "Tension or opposition",
    color: "#EF4444",
    strokeDasharray: "none",
    arrow: false,
  },
  {
    id: "refines",
    name: "Refines",
    description: "Evolution or development over time",
    color: "#F59E0B",
    strokeDasharray: "none",
    arrow: true,
    gradient: true,
  },
  {
    id: "meta-pattern",
    name: "Shares Meta Pattern",
    description: "Connected by recurring pattern",
    color: "#A78BFA",
    strokeDasharray: "2,4",
    arrow: false,
  },
];

export const seedNodes = [
  {
    id: "d-private",
    type: "domain",
    position: { x: -200, y: -200 },
    width: 600,
    height: 600,
    data: { label: "Private", domainId: "private" },
  },
  {
    id: "d-public",
    type: "domain",
    position: { x: 500, y: -200 },
    width: 600,
    height: 600,
    data: { label: "Public", domainId: "public" },
  },
  {
    id: "d-abstract",
    type: "domain",
    position: { x: 150, y: 300 },
    width: 600,
    height: 600,
    data: { label: "Abstract", domainId: "abstract" },
  },
  {
    id: "n-1",
    type: "content",
    position: { x: 420, y: 340 },
    data: {
      title: "Argument with Sam",
      perceivedPattern: "Had a disagreement about project priorities",
      interpretation:
        "Felt unheard and frustrated - maybe I'm not valued on the team",
      activeQuestions:
        "Why does this keep happening? Am I communicating poorly?",
      feltSense: "Tightness in chest, heat rising",
      agencyOrientation: "protective",
      agencyIntensity: 7,
      metaTags: ["Control loop", "Over-analysis"],
      patternType: "conflict",
      beforeState: "Felt confident about my ideas",
      afterState: "Doubting my place on the team",
      refinesNodeId: null,
      lensIds: ["empathy"],
      domainIds: ["private", "public"],
      mode: "social-first",
      notes: "Need to follow up tomorrow",
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: "n-2",
    type: "content",
    position: { x: 650, y: 320 },
    data: {
      title: "Manager expectations",
      perceivedPattern: "Unclear deliverables for Q4",
      interpretation: "Management is disorganized or intentionally vague",
      activeQuestions: "What are they actually expecting from me?",
      feltSense: "Fog, confusion, slight anxiety",
      agencyOrientation: "curious",
      agencyIntensity: 5,
      metaTags: ["Control loop"],
      patternType: "trigger",
      beforeState: "",
      afterState: "",
      refinesNodeId: null,
      lensIds: ["systems"],
      domainIds: ["public"],
      mode: "concept-first",
      notes: "",
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: "n-3",
    type: "content",
    position: { x: 480, y: 580 },
    data: {
      title: "Late-night rumination",
      perceivedPattern: "Replaying the day's interactions in my mind",
      interpretation: "I'm trying to control what I can't control",
      activeQuestions: "Why do I always worry about things I can't control?",
      feltSense: "Spinning thoughts, restless energy",
      agencyOrientation: "reactive",
      agencyIntensity: 8,
      metaTags: ["Over-analysis", "Control loop"],
      patternType: "loop",
      beforeState: "Relaxed evening",
      afterState: "Unable to settle",
      refinesNodeId: null,
      lensIds: ["aesthetic", "empathy"],
      domainIds: ["abstract", "private"],
      mode: "narrative-first",
      notes: "",
      createdAt: new Date().toISOString(),
    },
  },
];

export const seedEdges = [
  {
    id: "e1",
    source: "n-1",
    target: "n-2",
    label: "Influences",
    type: "influences",
  },
  {
    id: "e2",
    source: "n-2",
    target: "n-3",
    label: "Triggers",
    type: "influences",
  },
  { id: "e3", source: "n-1", target: "n-3", label: "Mirrors", type: "mirrors" },
];
