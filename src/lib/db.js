// src/lib/db.js
import Dexie from 'dexie';
import { seedNodes, seedEdges, defaultLenses } from '../seedData';

export const db = new Dexie('PerceptionMapDB');

db.version(1).stores({
  nodes: '++id, title, type, domainIds, lensIds, createdAt',
  edges: '++id, source, target, label',
  lenses: '++id, name, color',
  settings: 'key'
});

// Initialize database with seed data if empty
export async function initializeDB() {
  try {
    const nodeCount = await db.nodes.count();
    const edgeCount = await db.edges.count();
    const lensCount = await db.lenses.count();

    if (nodeCount === 0) {
      await db.nodes.bulkAdd(seedNodes);
      console.log('Seeded nodes');
    }

    if (edgeCount === 0) {
      await db.edges.bulkAdd(seedEdges);
      console.log('Seeded edges');
    }

    if (lensCount === 0) {
      await db.lenses.bulkAdd(defaultLenses);
      console.log('Seeded lenses');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Node operations
export async function getAllNodes() {
  return await db.nodes.toArray();
}

export async function addNode(node) {
  return await db.nodes.add(node);
}

export async function updateNode(id, updates) {
  return await db.nodes.update(id, updates);
}

export async function deleteNode(id) {
  // Also delete all edges connected to this node
  const connectedEdges = await db.edges.where('source').equals(id).or('target').equals(id).toArray();
  await db.edges.bulkDelete(connectedEdges.map(e => e.id));
  return await db.nodes.delete(id);
}

// Edge operations
export async function getAllEdges() {
  return await db.edges.toArray();
}

export async function addEdge(edge) {
  return await db.edges.add(edge);
}

export async function updateEdge(id, updates) {
  return await db.edges.update(id, updates);
}

export async function deleteEdge(id) {
  return await db.edges.delete(id);
}

// Lens operations
export async function getAllLenses() {
  return await db.lenses.toArray();
}

export async function updateLenses(lenses) {
  await db.lenses.clear();
  return await db.lenses.bulkAdd(lenses);
}

// Settings operations
export async function getSetting(key) {
  return await db.settings.get(key);
}

export async function setSetting(key, value) {
  return await db.settings.put({ key, value });
}