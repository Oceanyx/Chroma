// src/lib/db.js - V2 with Dimension Migration
import Dexie from "dexie";
import { seedNodes, seedEdges, lenses } from "../seedData";

export const db = new Dexie("PerceptionMapDB_v2");

// ============================================================================
// DATABASE SCHEMA V2
// ============================================================================
db.version(2)
  .stores({
    nodes: "++id, type, parentId, timestamp, dimension",
    edges: "++id, sourceId, targetId, createdAt, type",
    lenses: "++id, label",
    patterns: "++id, label",
    settings: "key",
  })
  .upgrade(async (tx) => {
    // Migrate old 'domain' to new 'dimension'
    const nodes = await tx.table("nodes").toArray();

    const dimensionMapping = {
      private: "subjective",
      public: "intersubjective",
      abstract: "symbolic",
    };

    for (const node of nodes) {
      if (node.domain && !node.dimension) {
        const newDimension = dimensionMapping[node.domain] || node.domain;
        await tx.table("nodes").update(node.id, {
          dimension: newDimension,
        });
        console.log(
          `Migrated node ${node.id}: ${node.domain} → ${newDimension}`,
        );
      }
    }

    // Add default edge types
    const edges = await tx.table("edges").toArray();
    for (const edge of edges) {
      if (!edge.type) {
        await tx.table("edges").update(edge.id, { type: "temporal" });
      }
    }

    console.log("✅ Database migration to V2 complete");
  });

// ============================================================================
// INITIALIZE WITH SEED DATA
// ============================================================================
export async function initializeDB() {
  try {
    const nodeCount = await db.nodes.count();

    if (nodeCount === 0) {
      await db.nodes.bulkAdd(seedNodes);
      console.log("✅ Seeded nodes");

      await db.edges.bulkAdd(seedEdges);
      console.log("✅ Seeded edges");

      await db.lenses.bulkAdd(lenses);
      console.log("✅ Seeded lenses");

      // Add default settings
      await db.settings.put({ key: "showOrbitalPaths", value: true });
      console.log("✅ Seeded settings");
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
  const node = await db.nodes.get(id);
  if (!node) return;

  if (node.type === "O" || node.type === "A") {
    const childMoons = await db.nodes.where("parentId").equals(id).toArray();
    if (childMoons.length > 0) {
      return {
        requiresConfirmation: true,
        childCount: childMoons.length,
        children: childMoons,
      };
    }
  }

  await db.nodes.delete(id);
  const connectedEdges = await db.edges
    .filter((e) => e.sourceId === id || e.targetId === id)
    .toArray();
  await db.edges.bulkDelete(connectedEdges.map((e) => e.id));

  return { success: true };
}

export async function cascadeDeleteNode(id) {
  const childMoons = await db.nodes.where("parentId").equals(id).toArray();
  await db.nodes.bulkDelete(childMoons.map((m) => m.id));
  await db.nodes.delete(id);

  const connectedEdges = await db.edges
    .filter((e) => e.sourceId === id || e.targetId === id)
    .toArray();
  await db.edges.bulkDelete(connectedEdges.map((e) => e.id));

  return { success: true };
}

export async function getMoonsByParentId(parentId) {
  return await db.nodes.where("parentId").equals(parentId).toArray();
}

export async function getMoonsGroupedByDimension(parentId) {
  const moons = await getMoonsByParentId(parentId);

  return {
    subjective: moons.filter((m) => m.dimension === "subjective"),
    intersubjective: moons.filter((m) => m.dimension === "intersubjective"),
    behavioral: moons.filter((m) => m.dimension === "behavioral"),
    symbolic: moons.filter((m) => m.dimension === "symbolic"),
  };
}

// ============================================================================
// EDGE OPERATIONS
// ============================================================================

export async function getAllEdges() {
  return await db.edges.toArray();
}

export async function addEdge(edge) {
  const source = await db.nodes.get(edge.sourceId);
  const target = await db.nodes.get(edge.targetId);

  if (source && target) {
    if (target.timestamp <= source.timestamp) {
      throw new Error("Target timestamp must be greater than source timestamp");
    }
  }

  // Default to temporal if no type specified
  if (!edge.type) {
    edge.type = "temporal";
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

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

export async function getSetting(key) {
  const setting = await db.settings.get(key);
  return setting?.value;
}

export async function setSetting(key, value) {
  return await db.settings.put({ key, value });
}
