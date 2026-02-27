// src/lib/db.js - V2.4 — multi-membership constellations (schema v5)
// Changes from V2.3:
//   - nodes: constellationId (scalar) → constellationIds (array)
//     A node can now belong to multiple constellations simultaneously.
//     A node is hidden only when ALL its constellations are collapsed.
//   - constellations: + note (string) + archetype (string) fields
//   - v5 upgrade migrates existing constellationId → constellationIds
//   - addEdge default type changed from "temporal" → "followed"
import Dexie from "dexie";
import { seedNodes, seedEdges, lenses } from "../seedData";

export const db = new Dexie("PerceptionMapDB_v3");

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

db.version(3)
	.stores({
		nodes: "++id, type, parentId, timestamp, dimension, constellationId",
		edges: "++id, sourceId, targetId, createdAt, type",
		lenses: "++id, label",
		patterns: "++id, label",
		settings: "key",
	})
	.upgrade(async (tx) => {
		const moons = await tx.table("nodes").where("type").equals("R").toArray();
		for (const moon of moons) {
			if (!moon.confidence) {
				await tx.table("nodes").update(moon.id, {
					confidence: "stable",
					intensity: moon.intensity || "medium",
					temporality: moon.temporality || "concurrent",
					versions: moon.versions || [],
					relationships: moon.relationships || [],
				});
			}
		}
	});

db.version(4).stores({
	nodes: "++id, type, parentId, timestamp, dimension, constellationId",
	edges: "++id, sourceId, targetId, createdAt, type",
	lenses: "++id, label",
	patterns: "++id, label",
	settings: "key",
	constellations: "++id, label, createdAt",
});

// V5 — multi-membership: constellationId → constellationIds[]
// Constellations gain note + archetype fields
db.version(5)
	.stores({
		nodes: "++id, type, parentId, timestamp, dimension",
		edges: "++id, sourceId, targetId, createdAt, type",
		lenses: "++id, label",
		patterns: "++id, label",
		settings: "key",
		constellations: "++id, label, createdAt",
	})
	.upgrade(async (tx) => {
		console.log(
			"🔄 Upgrading to v5: migrating constellation membership to arrays...",
		);

		const allNodes = await tx.table("nodes").toArray();
		for (const node of allNodes) {
			const existing = node.constellationId;
			await tx.table("nodes").update(node.id, {
				constellationIds: existing != null ? [existing] : [],
			});
		}

		const allConstellations = await tx.table("constellations").toArray();
		for (const c of allConstellations) {
			await tx.table("constellations").update(c.id, {
				note: c.note || "",
				archetype: c.archetype || "",
			});
		}

		console.log("✅ v5 migration complete");
	});

// V6 — dimension rename: "symbolic" → "framing"
//       Moon gains: claimType ("reporting"|"reading"), vantage ("mine"|"theirs"), lensUsed (single id)
//       Node gains: context (string), focalQuestion (string), temporalDistance (string)
//       Lens records gain: instructions (object keyed by dimension)
db.version(6)
	.stores({
		nodes: "++id, type, parentId, timestamp, dimension",
		edges: "++id, sourceId, targetId, createdAt, type",
		lenses: "++id, label",
		patterns: "++id, label",
		settings: "key",
		constellations: "++id, label, createdAt",
	})
	.upgrade(async (tx) => {
		console.log(
			"🔄 Upgrading to v6: renaming symbolic→framing, adding moon/planet fields...",
		);

		// Rename dimension on all reflection nodes
		const reflections = await tx
			.table("nodes")
			.where("type")
			.equals("R")
			.toArray();
		for (const r of reflections) {
			if (r.dimension === "symbolic") {
				await tx.table("nodes").update(r.id, { dimension: "framing" });
			}
			// Add new moon fields with defaults
			const updates = {};
			if (!r.claimType) updates.claimType = "reporting";
			if (!r.lensUsed) updates.lensUsed = (r.lensesUsed || [])[0] || null;
			if (Object.keys(updates).length) {
				await tx.table("nodes").update(r.id, updates);
			}
		}

		// Add new planet fields
		const planets = await tx
			.table("nodes")
			.filter((n) => n.type === "O" || n.type === "A" || n.type === "I")
			.toArray();
		for (const p of planets) {
			const updates = {};
			if (p.context === undefined) updates.context = "";
			if (p.focalQuestion === undefined) updates.focalQuestion = "";
			if (p.temporalDistance === undefined) updates.temporalDistance = null;
			if (Object.keys(updates).length) {
				await tx.table("nodes").update(p.id, updates);
			}
		}

		// Replace lens records with new 5-lens set
		await tx.table("lenses").clear();
		const { lenses: newLenses } = await import("../seedData");
		await tx.table("lenses").bulkAdd(newLenses);

		console.log("✅ v6 migration complete");
	});

export async function initializeDB() {
	try {
		const nodeCount = await db.nodes.count();
		if (nodeCount === 0) {
			const nodes = seedNodes.map((n) => ({ ...n, constellationIds: [] }));
			await db.nodes.bulkAdd(nodes);
			await db.edges.bulkAdd(seedEdges);
			await db.lenses.bulkAdd(lenses);
			await db.settings.put({ key: "showOrbitalPaths", value: true });
			await db.settings.put({ key: "showAllDimensions", value: false });
			await db.settings.put({ key: "totalReflectionCount", value: 0 });
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
	if (node.type === "O" || node.type === "A") {
		node.archetype = node.archetype || "neutral";
	}
	node.constellationIds = node.constellationIds || [];
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

	for (const cid of node.constellationIds || []) {
		await removeNodeFromConstellation(id, cid);
	}

	await db.nodes.delete(id);
	const connectedEdges = await db.edges
		.filter((e) => e.sourceId === id || e.targetId === id)
		.toArray();
	await db.edges.bulkDelete(connectedEdges.map((e) => e.id));
	return { success: true };
}

export async function cascadeDeleteNode(id) {
	const node = await db.nodes.get(id);
	if (node) {
		for (const cid of node.constellationIds || []) {
			await removeNodeFromConstellation(id, cid);
		}
	}
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
		framing: moons.filter((m) => m.dimension === "framing"),
	};
}

// ============================================================================
// PROGRESSIVE UNLOCK OPERATIONS
// ============================================================================

export async function getTotalReflectionCount() {
	const count = await db.nodes.where("type").equals("R").count();
	await db.settings.put({ key: "totalReflectionCount", value: count });
	return count;
}

export async function getUnlockedDimensions() {
	const totalReflections = await getTotalReflectionCount();
	const showAll = await getSetting("showAllDimensions");
	if (showAll)
		return ["subjective", "behavioral", "intersubjective", "framing"];
	const unlocked = ["subjective", "intersubjective"];
	if (totalReflections >= 5) unlocked.push("behavioral");
	if (totalReflections >= 15) unlocked.push("framing");
	return unlocked;
}

export async function checkDimensionUnlock(previousCount, newCount) {
	const unlocks = [];
	if (previousCount < 5 && newCount >= 5) {
		unlocks.push({
			dimension: "behavioral",
			message:
				"🎉 Behavioral dimension unlocked! Track what you actually did or said.",
		});
	}
	if (previousCount < 15 && newCount >= 15) {
		unlocks.push({
			dimension: "framing",
			message:
				"🎉 Framing dimension unlocked! Apply conceptual frameworks to illuminate what was happening.",
		});
	}
	return unlocks;
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
	if (!edge.type) edge.type = "followed";
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

// ============================================================================
// CONSTELLATION OPERATIONS
//
// Constellation record:
//   {
//     id: number,
//     label: string,       — short name ("Morning arc")
//     note: string,        — what this sequence means as a whole
//     archetype: string,   — one of CONSTELLATION_ARCHETYPES keys or ""
//     nodeIds: number[],
//     collapsed: boolean,
//     createdAt: number
//   }
//
// Node membership: constellationIds: number[]
//   A node can belong to multiple constellations.
//   A node is hidden on the canvas only when ALL its constellations are collapsed.
// ============================================================================

export async function getAllConstellations() {
	return await db.constellations.toArray();
}

/**
 * Creates a new constellation.
 * Appends the new id to constellationIds[] on each member node — non-destructive,
 * so existing memberships are preserved.
 */
export async function addConstellation({ label, nodeIds }) {
	const id = await db.constellations.add({
		label: label.trim() || "Constellation",
		note: "",
		archetype: "",
		nodeIds,
		collapsed: false,
		createdAt: Date.now(),
	});

	for (const nodeId of nodeIds) {
		const node = await db.nodes.get(nodeId);
		if (!node) continue;
		const current = node.constellationIds || [];
		if (!current.includes(id)) {
			await db.nodes.update(nodeId, { constellationIds: [...current, id] });
		}
	}

	return id;
}

/**
 * Partial update — { collapsed, label, note, archetype }.
 */
export async function updateConstellation(id, updates) {
	return await db.constellations.update(id, updates);
}

/**
 * Dissolves a constellation and removes its id from all member nodes.
 */
export async function dissolveConstellation(id) {
	const c = await db.constellations.get(id);
	if (c) {
		for (const nodeId of c.nodeIds) {
			const node = await db.nodes.get(nodeId);
			if (!node) continue;
			await db.nodes.update(nodeId, {
				constellationIds: (node.constellationIds || []).filter(
					(cid) => cid !== id,
				),
			});
		}
	}
	return await db.constellations.delete(id);
}

/**
 * Removes one node from a constellation.
 * Auto-dissolves if fewer than 2 members remain.
 * Returns { dissolved: boolean }.
 */
export async function removeNodeFromConstellation(nodeId, constellationId) {
	const c = await db.constellations.get(constellationId);
	if (!c) return { dissolved: true };

	const remaining = c.nodeIds.filter((id) => id !== nodeId);

	const node = await db.nodes.get(nodeId);
	if (node) {
		await db.nodes.update(nodeId, {
			constellationIds: (node.constellationIds || []).filter(
				(id) => id !== constellationId,
			),
		});
	}

	if (remaining.length < 2) {
		for (const nid of remaining) {
			const n = await db.nodes.get(nid);
			if (n) {
				await db.nodes.update(nid, {
					constellationIds: (n.constellationIds || []).filter(
						(id) => id !== constellationId,
					),
				});
			}
		}
		await db.constellations.delete(constellationId);
		return { dissolved: true };
	}

	await db.constellations.update(constellationId, { nodeIds: remaining });
	return { dissolved: false };
}
