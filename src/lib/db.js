// src/lib/db-v2.js
import Dexie from "dexie";

const db = new Dexie("PerceptionMapV2");

db.version(1).stores({
  nodes: "++id, type, parentId, timestamp",
  edges: "++id, sourceId, targetId, createdAt",
  lenses: "++id, label",
  patterns: "++id, label",
});

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

export const createReflection = (parentId, domain, text, lensesUsed, slot) => ({
  type: "R",
  parentId,
  domain, // 'private' | 'public' | 'abstract'
  text,
  lensesUsed, // array of lens IDs
  slot, // 0-7 (compass position)
  isLocked: false, // Tidal lock state
});

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

export { db };
