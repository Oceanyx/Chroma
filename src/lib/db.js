// src/lib/db.js - NEW Schema with Parent-Child Support
import Dexie from "dexie";
import { seedNodes, seedEdges, lenses } from "../seedData";

export const db = new Dexie("PerceptionMapDB_v2");

// ============================================================================
// DATABASE SCHEMA
// ============================================================================
db.version(1).stores({
  nodes: "++id, type, parentId, timestamp, domain",
  edges: "++id, sourceId, targetId, createdAt",
  lenses: "++id, label",
  patterns: "++id, label",
});

// ============================================================================
// INITIALIZE WITH SEED DATA
// ============================================================================
export async function initializeDB() {
  try {
    const nodeCount = await db.nodes.count();

    if (nodeCount === 0) {
      // Seed nodes
      await db.nodes.bulkAdd(seedNodes);
      console.log("✅ Seeded nodes");

      // Seed edges
      await db.edges.bulkAdd(seedEdges);
      console.log("✅ Seeded edges");

      // Seed lenses
      await db.lenses.bulkAdd(lenses);
      console.log("✅ Seeded lenses");
    }
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
}

// ============================================================================
// NODE OPERATIONS
// ============================================================================

export async function getAllNodes() {
  return await db.nodes.toArray();
}

export async function getNodeById(id) {
  return await db.nodes.get(id);
}

export async function addNode(node) {
  return await db.nodes.add(node);
}

export async function updateNode(id, updates) {
  return await db.nodes.update(id, updates);
}

export async function deleteNode(id) {
  // Get the node to check if it's a parent
  const node = await db.nodes.get(id);

  if (!node) return;

  // If it's a parent (O or A), find all child moons
  if (node.type === "O" || node.type === "A") {
    const childMoons = await db.nodes.where("parentId").equals(id).toArray();

    if (childMoons.length > 0) {
      // Return info for confirmation dialog
      return {
        requiresConfirmation: true,
        childCount: childMoons.length,
        children: childMoons,
      };
    }
  }

  // Delete the node
  await db.nodes.delete(id);

  // Delete all connected edges
  const connectedEdges = await db.edges
    .filter((e) => e.sourceId === id || e.targetId === id)
    .toArray();

  await db.edges.bulkDelete(connectedEdges.map((e) => e.id));

  return { success: true };
}

// CASCADE DELETE - Call this after user confirms
export async function cascadeDeleteNode(id) {
  // Delete all child moons first
  const childMoons = await db.nodes.where("parentId").equals(id).toArray();
  await db.nodes.bulkDelete(childMoons.map((m) => m.id));

  // Delete the parent node
  await db.nodes.delete(id);

  // Delete all connected edges
  const connectedEdges = await db.edges
    .filter((e) => e.sourceId === id || e.targetId === id)
    .toArray();

  await db.edges.bulkDelete(connectedEdges.map((e) => e.id));

  return { success: true };
}

// Get all moons for a parent planet
export async function getMoonsByParentId(parentId) {
  return await db.nodes.where("parentId").equals(parentId).toArray();
}

// Get moons grouped by domain for a parent
export async function getMoonsGroupedByDomain(parentId) {
  const moons = await getMoonsByParentId(parentId);

  return {
    private: moons.filter((m) => m.domain === "private"),
    public: moons.filter((m) => m.domain === "public"),
    abstract: moons.filter((m) => m.domain === "abstract"),
  };
}

// ============================================================================
// EDGE OPERATIONS
// ============================================================================

export async function getAllEdges() {
  return await db.edges.toArray();
}

export async function addEdge(edge) {
  // Validate timestamp constraint
  const source = await db.nodes.get(edge.sourceId);
  const target = await db.nodes.get(edge.targetId);

  if (source && target) {
    if (target.timestamp <= source.timestamp) {
      throw new Error("Target timestamp must be greater than source timestamp");
    }
  }

  return await db.edges.add(edge);
}

export async function updateEdge(id, updates) {
  return await db.edges.update(id, updates);
}

export async function deleteEdge(id) {
  return await db.edges.delete(id);
}

export async function getEdgesForNode(nodeId) {
  return await db.edges
    .filter((e) => e.sourceId === nodeId || e.targetId === nodeId)
    .toArray();
}

// ============================================================================
// LENS OPERATIONS
// ============================================================================

export async function getAllLenses() {
  return await db.lenses.toArray();
}

export async function updateLenses(lenses) {
  await db.lenses.clear();
  return await db.lenses.bulkAdd(lenses);
}

// ============================================================================
// PATTERN OPERATIONS
// ============================================================================

export async function getAllPatterns() {
  return await db.patterns.toArray();
}

export async function addPattern(pattern) {
  return await db.patterns.add(pattern);
}

export async function deletePattern(id) {
  return await db.patterns.delete(id);
}
