// src/seedData.js

export const domainColors = {
  private: "#FFB84D",
  public: "#4D9FFF",
  abstract: "#6EE7B7"
};

export const defaultLenses = [
  { 
    id: 'psychological', 
    name: 'Psychological', 
    color: '#EC4899',
    questions: [
      'What inner drives, fears, or wounds might be active here?',
      'What ego patterns or habits am I noticing in myself?'
    ]
  },
  { 
    id: 'somatic', 
    name: 'Somatic', 
    color: '#F59E0B',
    questions: [
      'What is my body telling me through sensations or tension?',
      'Where do I feel this physically, and what energy is present?'
    ]
  },
  { 
    id: 'aesthetic', 
    name: 'Aesthetic', 
    color: '#8B5CF6',
    questions: [
      'What is the felt quality, vibe, or texture of this moment?',
      'What beauty or symbolic meaning do I perceive here?'
    ]
  },
  { 
    id: 'empathy', 
    name: 'Empathy', 
    color: '#10B981',
    questions: [
      'How might this feel from someone else\'s inner world?',
      'What might they be needing or experiencing right now?'
    ]
  },
  { 
    id: 'systems', 
    name: 'Systems', 
    color: '#3B82F6',
    questions: [
      'What structures, incentives, or constraints shape this situation?',
      'How do the parts of this system influence each other?'
    ]
  },
  { 
    id: 'existential', 
    name: 'Existential', 
    color: '#6366F1',
    questions: [
      'What does this mean in the context of mortality and freedom?',
      'Why does this matter, or what makes it significant?'
    ]
  },
  { 
    id: 'mythic', 
    name: 'Mythic', 
    color: '#EF4444',
    questions: [
      'What archetypal pattern or story is playing out here?',
      'What role am I embodying (Hero, Shadow, Creator, Outsider)?'
    ]
  }
];


// Connection types with visual styling
export const connectionTypes = [
  { id: 'influences', name: 'Influences', description: 'Causal or directional impact', color: '#6C63FF', strokeDasharray: 'none', arrow: true },
  { id: 'mirrors', name: 'Mirrors', description: 'Parallel or reflected pattern', color: '#10B981', strokeDasharray: '5,5', arrow: false },
  { id: 'contradicts', name: 'Contradicts', description: 'Tension or opposition', color: '#EF4444', strokeDasharray: 'none', arrow: false },
  { id: 'refines', name: 'Refines', description: 'Evolution or development over time', color: '#F59E0B', strokeDasharray: 'none', arrow: true, gradient: true },
  { id: 'meta-pattern', name: 'Shares Meta Pattern', description: 'Connected by recurring pattern', color: '#A78BFA', strokeDasharray: '2,4', arrow: false }
];

export const seedNodes = [
  {
    id: "d-private",
    type: "domain",
    position: { x: -200, y: -200 },  
    width: 600,
    height: 600,
    data: { label: "Private", domainId: "private" }
  },
  {
    id: "d-public",
    type: "domain",
    position: { x: 500, y: -200 }, 
    width: 600,
    height: 600,
    data: { label: "Public", domainId: "public" }
  },
  {
    id: "d-abstract",
    type: "domain",
    position: { x: 150, y: 300 }, 
    width: 600,
    height: 600,
    data: { label: "Abstract", domainId: "abstract" }
  },
  {
    id: "n-1",
    type: "content",
    position: { x: 420, y: 340 },
    data: { 
      title: "Seed: Morning anxiety",
      rawCapture: "Woke up with tightness in chest, worrying about the presentation",
      timestamp: new Date().toISOString(),
      
      // Optional - filled in later
      domains: {
        private: null,
        public: null,
        abstract: null
      },
      
      lensIds: [],
      domainIds: ["private"],
      notes: ""
    }
  },
  {
    id: "n-2",
    type: "content",
    position: { x: 650, y: 320 },
    data: { 
      title: "Seed: Tense meeting with Sam",
      rawCapture: "Disagreement about priorities, felt unheard",
      timestamp: new Date().toISOString(),
      
      domains: {
        private: null,
        public: null,
        abstract: null
      },
      
      lensIds: [],
      domainIds: ["public", "private"],
      notes: ""
    }
  },
  {
    id: "n-3",
    type: "content",
    position: { x: 480, y: 580 },
    data: { 
      title: "Seed: Late night rumination",
      rawCapture: "Can't stop replaying the day's interactions",
      timestamp: new Date().toISOString(),
      
      domains: {
        private: null,
        public: null,
        abstract: null
      },
      
      lensIds: [],
      domainIds: ["private", "abstract"],
      notes: ""
    }
  }
];

export const seedEdges = [
  { id: "e1", source: "n-1", target: "n-2", label: "Influences", type: "influences" },
  { id: "e2", source: "n-2", target: "n-3", label: "Triggers", type: "influences" },
  { id: "e3", source: "n-1", target: "n-3", label: "Mirrors", type: "mirrors" }
];