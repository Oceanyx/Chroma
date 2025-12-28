// src/lib/db.js
import Dexie from "dexie";

const db = new Dexie("PerceptionMapV2");

db.version(1).stores({
  nodes: "++id, type, parentId, timestamp",
  edges: "++id, sourceId, targetId, createdAt",
  lenses: "++id, label",
  patterns: "++id, label",
});

// Orbital calculation helpers
const ORBIT_RADIUS = 120;
const COMPASS_SLOTS = 8; // N, NE, E, SE, S, SW, W, NW

export const calculateSlotPosition = (parentX, parentY, slot) => {
  const angle = (slot * Math.PI * 2) / COMPASS_SLOTS;
  return {
    x: parentX + ORBIT_RADIUS * Math.cos(angle - Math.PI / 2), // -PI/2 to start at North
    y: parentY + ORBIT_RADIUS * Math.sin(angle - Math.PI / 2),
  };
};

export const findLargestGaps = (occupiedSlots, count = 3) => {
  if (occupiedSlots.length === 0) {
    return [0, 2, 4]; // Default: N, E, S
  }

  const sorted = [...occupiedSlots].sort((a, b) => a - b);
  const gaps = [];

  for (let i = 0; i < sorted.length; i++) {
    const next = sorted[(i + 1) % sorted.length];
    const gapSize =
      next > sorted[i] ? next - sorted[i] : COMPASS_SLOTS - sorted[i] + next;

    gaps.push({
      start: sorted[i],
      size: gapSize,
      midpoint: (sorted[i] + Math.floor(gapSize / 2)) % COMPASS_SLOTS,
    });
  }

  // If no siblings, add gap for full circle
  if (
    sorted.length === occupiedSlots.length &&
    occupiedSlots.length < COMPASS_SLOTS
  ) {
    const lastSlot = sorted[sorted.length - 1];
    const firstSlot = sorted[0];
    const finalGap = COMPASS_SLOTS - lastSlot + firstSlot;
    gaps.push({
      start: lastSlot,
      size: finalGap,
      midpoint: (lastSlot + Math.floor(finalGap / 2)) % COMPASS_SLOTS,
    });
  }

  return gaps
    .sort((a, b) => b.size - a.size)
    .slice(0, count)
    .map((g) => g.midpoint);
};

// Schema enforcement helpers
export const createObservation = (text, x, y) => ({
  type: "O",
  text,
  timestamp: Date.now(),
  x,
  y,
});

export const createAction = (text, state, x, y) => ({
  type: "A",
  text,
  timestamp: Date.now(),
  state, // 'past' | 'present' | 'future'
  x,
  y,
});

export const createReflection = (
  parentId,
  domain,
  text,
  lensesUsed,
  slot,
  parentX,
  parentY
) => {
  const position = calculateSlotPosition(parentX, parentY, slot);
  return {
    type: "R",
    parentId,
    domain, // 'private' | 'public' | 'abstract'
    text,
    lensesUsed, // array of lens IDs
    slot, // 0-7 (compass position)
    isLocked: false, // Tidal lock state
    x: position.x,
    y: position.y,
  };
};

export const createPattern = (label, nodeIds) => ({
  type: "P",
  label,
  nodeIds,
});

export const createEdge = (sourceId, targetId) => ({
  sourceId,
  targetId,
  createdAt: Date.now(),
});

// Database operations
export const addNode = async (node) => {
  return await db.nodes.add(node);
};

export const updateNode = async (id, updates) => {
  return await db.nodes.update(id, updates);
};

export const deleteNode = async (id) => {
  return await db.nodes.delete(id);
};

export const getAllNodes = async () => {
  return await db.nodes.toArray();
};

export const getNodeById = async (id) => {
  return await db.nodes.get(id);
};

export const addEdge = async (edge) => {
  // Validate timestamp constraint
  const source = await db.nodes.get(edge.sourceId);
  const target = await db.nodes.get(edge.targetId);

  if (
    target.timestamp &&
    source.timestamp &&
    target.timestamp <= source.timestamp
  ) {
    throw new Error("Target timestamp must be greater than source timestamp");
  }

  // If source is R node, mark it as tidally locked
  if (source.type === "R") {
    await updateNode(edge.sourceId, { isLocked: true });
  }

  return await db.edges.add(edge);
};

export const deleteEdge = async (id) => {
  return await db.edges.delete(id);
};

export const getAllEdges = async () => {
  return await db.edges.toArray();
};

export const getChildNodes = async (parentId) => {
  return await db.nodes.where({ parentId }).toArray();
};

export const initializeDB = async () => {
  await db.open();
};

export {
  db,
  ORBIT_RADIUS,
  COMPASS_SLOTS,
  findLargestGaps,
  calculateSlotPosition,
};
