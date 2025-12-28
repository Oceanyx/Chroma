// src/lib/lenses.js
export const lenses = [
  {
    id: "somatic",
    label: "Somatic",
    prompt: "What internal sensations are alive in my body right now?",
    appliesTo: ["R", "O"],
  },
  {
    id: "empathy",
    label: "Empathy",
    prompt:
      "How might this look through the eyes of the other person involved?",
    appliesTo: ["R"],
  },
  {
    id: "systems",
    label: "Systems",
    prompt: "What larger structure or recurring cycle is this a part of?",
    appliesTo: ["R", "A"],
  },
  {
    id: "temporal",
    label: "Temporal",
    prompt: "How will I feel about this specific event 10 years from now?",
    appliesTo: ["R", "A"],
  },
  {
    id: "strategist",
    label: "Strategist",
    prompt:
      "What is the smallest, most effective next step to move this forward?",
    appliesTo: ["A"],
  },
];

// Helper to get lenses applicable to a node type
export const getLensesForNodeType = (nodeType) => {
  return lenses.filter((lens) => lens.appliesTo.includes(nodeType));
};
