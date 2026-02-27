// src/components/SpaceCanvas.jsx - V3.5
// New in this version:
//   - Constellation grouping (manual, no auto-suggestion)
//     • Ctrl/Cmd+click planets to multi-select (dashed purple rings)
//     • Right-click canvas or a selected planet → "Form Constellation"
//     • Inline label input → creates nebula + DB record
//     • Click nebula to expand; right-click nebula for Dissolve
//     • Expanded constellations show a smooth convex-hull boundary
//     • Right-click a planet inside an expanded constellation → "Remove from Constellation"
//   - Constellation state loaded from / persisted to IndexedDB
//   - Context menu closes on any canvas click or Escape

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
	db,
	initializeDB,
	getAllNodes,
	getAllEdges,
	getAllConstellations,
	getUnlockedDimensions,
	deleteEdge,
	addConstellation,
	updateConstellation,
	dissolveConstellation,
	removeNodeFromConstellation,
} from "../lib/db";
import {
	groupMoonsByDimension,
	distributeMoonsEvenly,
	calculateAnimatedOrbit,
	getOrbitalPaths,
} from "../lib/orbitalPhysics";
import { planetConfig } from "../seedData";
import Planet from "./Planet";
import Moon from "./Moon";
import ConnectionLine, { CONNECTION_TYPES } from "./ConnectionLine";
import ReflectionMode from "./ReflectionMode";
import NodeTypePicker from "./NodeTypePicker";
import NodeTextInput from "./NodeTextInput";
import TopNav from "./TopNav";
import PlanetSidePanel from "./PlanetSidePanel";
import ConstellationNebula from "./ConstellationNebula";
import { CANVAS } from "../utils/constants";
import { CONSTELLATION_ARCHETYPES } from "../utils/constellationConfig";

const DRAG_THRESHOLD = 4;
const ORBIT_SCALE = 0.62;
const CONSTELLATION_COLOR = "rgba(108, 99, 255, ";
const HULL_PADDING_MIN = 80; // minimum hull padding (no moons)

// Orbit radii from seedData (raw) × ORBIT_SCALE + moon radius + breathing room
const ORBIT_EFFECTIVE = {
	subjective: 155 * ORBIT_SCALE + 16 + 24, // ~136px
	behavioral: 245 * ORBIT_SCALE + 24 + 24, // ~200px
	intersubjective: 355 * ORBIT_SCALE + 32 + 24, // ~276px
	framing: 500 * ORBIT_SCALE + 40 + 28, // ~378px
};

/**
 * Returns the hull padding needed to envelope moons of the given member nodes.
 * Uses the outermost orbit that any member planet has moons in.
 */
function dynamicHullPadding(memberNodeIds, allNodes) {
	const memberIds = new Set(memberNodeIds);
	const planets = allNodes.filter((n) => memberIds.has(n.id));

	let maxPadding = HULL_PADDING_MIN;
	const dimensionOrder = [
		"framing",
		"intersubjective",
		"behavioral",
		"subjective",
	];

	for (const planet of planets) {
		const moons = allNodes.filter((n) => n.parentId === planet.id);
		for (const dim of dimensionOrder) {
			if (moons.some((m) => m.dimension === dim)) {
				const needed = ORBIT_EFFECTIVE[dim] || HULL_PADDING_MIN;
				if (needed > maxPadding) maxPadding = needed;
				break; // outermost occupied dimension found for this planet
			}
		}
	}

	return maxPadding;
}

// CONSTELLATION_ARCHETYPES imported from ../utils/constellationConfig

// ─────────────────────────────────────────────────────────────────────────────
// Convex hull + hull-to-SVG-path helpers
// ─────────────────────────────────────────────────────────────────────────────

function crossProduct(O, A, B) {
	return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

/** Andrew's monotone chain — O(n log n) convex hull. */
function convexHull(points) {
	if (points.length < 2) return [...points];
	const sorted = [...points].sort((a, b) =>
		a.x === b.x ? a.y - b.y : a.x - b.x,
	);
	const lower = [];
	for (const p of sorted) {
		while (
			lower.length >= 2 &&
			crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
		)
			lower.pop();
		lower.push(p);
	}
	const upper = [];
	for (let i = sorted.length - 1; i >= 0; i--) {
		const p = sorted[i];
		while (
			upper.length >= 2 &&
			crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
		)
			upper.pop();
		upper.push(p);
	}
	upper.pop();
	lower.pop();
	return [...lower, ...upper];
}

/** Expands every hull vertex outward from the centroid by `padding` units. */
function padHull(hull, padding) {
	if (hull.length === 0) return hull;
	const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
	const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
	return hull.map((p) => {
		const dx = p.x - cx;
		const dy = p.y - cy;
		const dist = Math.sqrt(dx * dx + dy * dy) || 1;
		return { x: p.x + (dx / dist) * padding, y: p.y + (dy / dist) * padding };
	});
}

/**
 * Converts a polygon (array of {x,y}) into a smooth closed SVG path using
 * Catmull-Rom → cubic Bézier tangent estimation.
 */
function hullToSvgPath(pts) {
	const n = pts.length;
	if (n < 2) return "";
	if (n === 2) {
		// Degenerate — draw a rounded capsule between two points
		const mx = (pts[0].x + pts[1].x) / 2;
		const my = (pts[0].y + pts[1].y) / 2;
		const r = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) / 2 + 30;
		return `M ${mx} ${my - r} A ${r} ${r} 0 1 1 ${mx} ${my + r} A ${r} ${r} 0 1 1 ${mx} ${my - r} Z`;
	}

	let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
	for (let i = 0; i < n; i++) {
		const p0 = pts[(i - 1 + n) % n];
		const p1 = pts[i];
		const p2 = pts[(i + 1) % n];
		const p3 = pts[(i + 2) % n];
		const cp1x = p1.x + (p2.x - p0.x) / 6;
		const cp1y = p1.y + (p2.y - p0.y) / 6;
		const cp2x = p2.x - (p3.x - p1.x) / 6;
		const cp2y = p2.y - (p3.y - p1.y) / 6;
		d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
	}
	return d + " Z";
}

/** Returns centroid of a list of world-space {x,y} points. */
function centroid(points) {
	const x = points.reduce((s, p) => s + p.x, 0) / points.length;
	const y = points.reduce((s, p) => s + p.y, 0) / points.length;
	return { x, y };
}

// ─────────────────────────────────────────────────────────────────────────────
// Context-menu styles (shared)
// ─────────────────────────────────────────────────────────────────────────────
const menuStyle = {
	position: "fixed",
	zIndex: 500,
	background: "#111827",
	border: "1px solid rgba(108,99,255,0.35)",
	borderRadius: 8,
	padding: "4px 0",
	minWidth: 200,
	boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
};

const menuItemStyle = {
	display: "block",
	width: "100%",
	padding: "8px 14px",
	background: "none",
	border: "none",
	textAlign: "left",
	color: "rgba(255,255,255,0.85)",
	fontSize: 13,
	fontFamily: "system-ui, sans-serif",
	cursor: "pointer",
	whiteSpace: "nowrap",
};

const menuItemDangerStyle = {
	...menuItemStyle,
	color: "rgba(239,68,68,0.85)",
};

const menuDividerStyle = {
	margin: "4px 0",
	borderTop: "1px solid rgba(255,255,255,0.08)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SpaceCanvas({ purposeData, onPurposeUpdate }) {
	// ── Core data ─────────────────────────────────────────────────────────────
	const [nodes, setNodes] = useState([]);
	const [edges, setEdges] = useState([]);
	const [constellations, setConstellations] = useState([]);
	const [unlockedDimensions, setUnlockedDimensions] = useState([]);

	// ── Pan / zoom ─────────────────────────────────────────────────────────────
	const [zoom, setZoom] = useState(CANVAS.defaultZoom);
	const [pan, setPan] = useState(CANVAS.defaultPan);
	const [isPanning, setIsPanning] = useState(false);
	const [panStart, setPanStart] = useState({ x: 0, y: 0 });
	const [tool, setTool] = useState("select");

	// ── Drag ──────────────────────────────────────────────────────────────────
	const [draggingNodeId, setDraggingNodeId] = useState(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const hasDraggedRef = useRef(false);
	const mouseDownPosRef = useRef({ x: 0, y: 0 });

	// ── Node creation ─────────────────────────────────────────────────────────
	const [showNodeTypePicker, setShowNodeTypePicker] = useState(false);
	const [nodeTypePickerPos, setNodeTypePickerPos] = useState({ x: 0, y: 0 });
	const [showNodeTextInput, setShowNodeTextInput] = useState(false);
	const [nodeTextInputType, setNodeTextInputType] = useState(null);
	const [nodeCreationPos, setNodeCreationPos] = useState({ x: 0, y: 0 });

	// ── Connection creation ────────────────────────────────────────────────────
	const [creatingConnection, setCreatingConnection] = useState(false);
	const [connectionSource, setConnectionSource] = useState(null);
	const [connectionPreview, setConnectionPreview] = useState(null);

	// ── Selection ─────────────────────────────────────────────────────────────
	const [selectedNodeId, setSelectedNodeId] = useState(null);
	const [hoveredNodeId, setHoveredNodeId] = useState(null);
	const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
	/** Set of planet node ids selected via Ctrl/Cmd+click for constellation ops */
	const [multiSelectedIds, setMultiSelectedIds] = useState(new Set());

	// ── Reflection mode ────────────────────────────────────────────────────────
	const [reflectionMode, setReflectionMode] = useState({
		active: false,
		parentNodeId: null,
		previousView: { zoom: CANVAS.defaultZoom, pan: CANVAS.defaultPan },
	});

	// ── Animation ─────────────────────────────────────────────────────────────
	const [orbitTime, setOrbitTime] = useState(0);
	const animationFrameRef = useRef();
	const lastTimestampRef = useRef(null);
	const pausedTimeRef = useRef(null);

	// ── Constellation UI ──────────────────────────────────────────────────────
	/**
	 * contextMenu: null | { x, y, type, payload }
	 * types: 'multi-select' | 'nebula' | 'planet-in-constellation'
	 */
	const [contextMenu, setContextMenu] = useState(null);

	/**
	 * edgePopup: null | { edge, x, y, labelDraft }
	 * The inline editor shown when the user clicks an edge.
	 */
	const [edgePopup, setEdgePopup] = useState(null);

	/**
	 * constellationEditor: null | { constellationId }
	 * Side panel for editing a constellation's label/note/archetype.
	 */
	const [constellationEditor, setConstellationEditor] = useState(null);
	/**
	 * constellationInput: null | { nodeIds: number[], x: number, y: number, label: string }
	 * Active while the user is typing a label to create a new constellation.
	 */
	const [constellationInput, setConstellationInput] = useState(null);

	// ── Refs ──────────────────────────────────────────────────────────────────
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const labelInputRef = useRef(null);

	// ─────────────────────────────────────────────────────────────────────────
	// Load data
	// ─────────────────────────────────────────────────────────────────────────
	useEffect(() => {
		async function loadData() {
			await initializeDB();
			const [loadedNodes, loadedEdges, loadedConstellations] =
				await Promise.all([
					getAllNodes(),
					getAllEdges(),
					getAllConstellations(),
				]);
			setNodes(loadedNodes);
			setEdges(loadedEdges);
			setConstellations(loadedConstellations);
		}
		loadData();
	}, []);

	// Refresh unlocked dimensions only when moon count changes
	const moonCount = nodes.filter((n) => n.type === "R").length;
	useEffect(() => {
		getUnlockedDimensions().then(setUnlockedDimensions);
	}, [moonCount]);

	// ─────────────────────────────────────────────────────────────────────────
	// Orbit animation
	// ─────────────────────────────────────────────────────────────────────────
	useEffect(() => {
		const animate = (timestamp) => {
			if (!reflectionMode.active) {
				if (lastTimestampRef.current !== null) {
					const delta = Math.min(timestamp - lastTimestampRef.current, 100);
					if (!hoveredNodeId) setOrbitTime((prev) => prev + delta / 16.667);
				}
				lastTimestampRef.current = timestamp;
			} else {
				lastTimestampRef.current = null;
			}
			animationFrameRef.current = requestAnimationFrame(animate);
		};
		animationFrameRef.current = requestAnimationFrame(animate);
		return () => {
			if (animationFrameRef.current)
				cancelAnimationFrame(animationFrameRef.current);
		};
	}, [reflectionMode.active, hoveredNodeId]);

	// ─────────────────────────────────────────────────────────────────────────
	// Wheel zoom
	// ─────────────────────────────────────────────────────────────────────────
	useEffect(() => {
		const handleWheel = (e) => {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();
				const delta = e.deltaY > 0 ? -0.1 : 0.1;
				setZoom((prev) =>
					Math.min(Math.max(CANVAS.minZoom, prev + delta), CANVAS.maxZoom),
				);
			}
		};
		const canvas = canvasRef.current;
		if (canvas) {
			canvas.addEventListener("wheel", handleWheel, { passive: false });
			return () => canvas.removeEventListener("wheel", handleWheel);
		}
	}, []);

	// ─────────────────────────────────────────────────────────────────────────
	// Canvas mouse handlers
	// ─────────────────────────────────────────────────────────────────────────
	const handleCanvasMouseDown = (e) => {
		// Close overlays first; swallow the click so nothing else fires
		if (contextMenu) {
			setContextMenu(null);
			return;
		}
		if (edgePopup) {
			setEdgePopup(null);
			return;
		}
		if (constellationEditor) {
			setConstellationEditor(null);
			return;
		}
		if (e.shiftKey && tool === "select") return;

		if (
			tool === "select" &&
			(e.target === containerRef.current || e.target === canvasRef.current)
		) {
			setSelectedNodeId(null);
			setMultiSelectedIds(new Set());
			return;
		}

		if (
			tool === "hand" ||
			e.target === containerRef.current ||
			e.target === canvasRef.current
		) {
			setIsPanning(true);
			setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
			e.preventDefault();
		}
	};

	const handleCanvasMouseMove = (e) => {
		if (isPanning)
			setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });

		if (creatingConnection && connectionSource && canvasRef.current) {
			const r = canvasRef.current.getBoundingClientRect();
			setConnectionPreview({
				x: (e.clientX - r.left - pan.x) / zoom,
				y: (e.clientY - r.top - pan.y) / zoom,
			});
		}

		if (draggingNodeId && canvasRef.current) {
			const dx = e.clientX - mouseDownPosRef.current.x;
			const dy = e.clientY - mouseDownPosRef.current.y;
			if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD)
				hasDraggedRef.current = true;
			const r = canvasRef.current.getBoundingClientRect();
			const newX = (e.clientX - r.left - dragOffset.x - pan.x) / zoom;
			const newY = (e.clientY - r.top - dragOffset.y - pan.y) / zoom;
			setNodes((prev) =>
				prev.map((n) =>
					n.id === draggingNodeId
						? { ...n, position: { x: newX, y: newY } }
						: n,
				),
			);
		}
	};

	const handleCanvasDoubleClick = (e) => {
		if (tool !== "select") return;
		if (e.target !== containerRef.current && e.target !== canvasRef.current)
			return;
		const r = canvasRef.current.getBoundingClientRect();
		setNodeCreationPos({
			x: (e.clientX - r.left - pan.x) / zoom - planetConfig.baseRadius,
			y: (e.clientY - r.top - pan.y) / zoom - planetConfig.baseRadius,
		});
		setNodeTypePickerPos({ x: e.clientX, y: e.clientY });
		setShowNodeTypePicker(true);
	};

	const handleCanvasMouseUp = async () => {
		setIsPanning(false);

		if (draggingNodeId) {
			if (hasDraggedRef.current) {
				const node = nodes.find((n) => n.id === draggingNodeId);
				if (node) await db.nodes.update(node.id, { position: node.position });
			}
			setDraggingNodeId(null);
			hasDraggedRef.current = false;
		}

		if (creatingConnection && !connectionPreview) {
			setCreatingConnection(false);
			setConnectionSource(null);
			setConnectionPreview(null);
		}
	};

	/**
	 * Right-click on the canvas background.
	 * If 2+ planets are multi-selected, offer "Form Constellation".
	 */
	const handleCanvasContextMenu = (e) => {
		if (e.target !== containerRef.current && e.target !== canvasRef.current)
			return;
		e.preventDefault();
		if (multiSelectedIds.size >= 2) {
			setContextMenu({
				x: e.clientX,
				y: e.clientY,
				type: "multi-select",
				payload: null,
			});
		}
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Node creation
	// ─────────────────────────────────────────────────────────────────────────
	const handleNodeTypeSelect = (type) => {
		setNodeTextInputType(type);
		setShowNodeTypePicker(false);
		setShowNodeTextInput(true);
	};

	const handleNodeTextSave = async (text) => {
		await db.nodes.add({
			type: nodeTextInputType,
			text,
			timestamp: Date.now(),
			state: "present",
			position: nodeCreationPos,
		});
		setNodes(await getAllNodes());
		setShowNodeTextInput(false);
		setNodeTextInputType(null);
	};

	const handleNodeInputCancel = () => {
		setShowNodeTypePicker(false);
		setShowNodeTextInput(false);
		setNodeTextInputType(null);
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Edge deletion
	// ─────────────────────────────────────────────────────────────────────────
	const handleEdgeClick = useCallback((edge, clientX, clientY) => {
		setContextMenu(null);
		setEdgePopup({
			edge,
			x: clientX,
			y: clientY,
			labelDraft: edge.label || "",
		});
	}, []);

	const handleEdgeTypeChange = useCallback(
		async (type) => {
			if (!edgePopup) return;
			await db.edges.update(edgePopup.edge.id, { type });
			setEdges(await getAllEdges());
			setEdgePopup((prev) =>
				prev ? { ...prev, edge: { ...prev.edge, type } } : null,
			);
		},
		[edgePopup],
	);

	const handleEdgeLabelSave = useCallback(async () => {
		if (!edgePopup) return;
		await db.edges.update(edgePopup.edge.id, {
			label: edgePopup.labelDraft.trim() || null,
		});
		setEdges(await getAllEdges());
		setEdgePopup(null);
	}, [edgePopup]);

	const handleEdgeDelete = useCallback(async () => {
		if (!edgePopup) return;
		await deleteEdge(edgePopup.edge.id);
		setEdges((prev) => prev.filter((e) => e.id !== edgePopup.edge.id));
		setEdgePopup(null);
	}, [edgePopup]);

	// ─────────────────────────────────────────────────────────────────────────
	// Keyboard shortcuts
	// ─────────────────────────────────────────────────────────────────────────
	useEffect(() => {
		const down = (e) => {
			const typing =
				document.activeElement?.tagName === "INPUT" ||
				document.activeElement?.tagName === "TEXTAREA" ||
				document.activeElement?.isContentEditable;

			if (e.key === " " && !e.repeat && tool === "select" && !typing) {
				e.preventDefault();
				setTool("hand");
			}
			if (e.key === "Escape") {
				setContextMenu(null);
				setConstellationInput(null);
				setEdgePopup(null);
				setConstellationEditor(null);
				if (reflectionMode.active) exitReflectionMode();
				if (creatingConnection) {
					setCreatingConnection(false);
					setConnectionSource(null);
					setConnectionPreview(null);
				}
				if (showNodeTypePicker || showNodeTextInput) handleNodeInputCancel();
				if (selectedNodeId) setSelectedNodeId(null);
				if (multiSelectedIds.size > 0) setMultiSelectedIds(new Set());
			}
		};
		const up = (e) => {
			const typing =
				document.activeElement?.tagName === "INPUT" ||
				document.activeElement?.tagName === "TEXTAREA" ||
				document.activeElement?.isContentEditable;
			if (e.key === " " && tool === "hand" && !typing) setTool("select");
		};
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		return () => {
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
		};
	}, [
		tool,
		reflectionMode.active,
		creatingConnection,
		showNodeTypePicker,
		showNodeTextInput,
		selectedNodeId,
		multiSelectedIds,
		edgePopup,
		constellationEditor,
	]);

	// ─────────────────────────────────────────────────────────────────────────
	// Reflection mode
	// ─────────────────────────────────────────────────────────────────────────
	const enterReflectionMode = useCallback(
		(parentNode) => {
			const targetZoom = 2.5;
			const cx = window.innerWidth / 2;
			const cy = (window.innerHeight - 60) / 2 + 60;
			const nx = parentNode.position.x + planetConfig.baseRadius;
			const ny = parentNode.position.y + planetConfig.baseRadius;
			setSelectedNodeId(null);
			setMultiSelectedIds(new Set());
			setContextMenu(null);
			setReflectionMode({
				active: true,
				parentNodeId: parentNode.id,
				previousView: { zoom, pan },
			});
			setZoom(targetZoom);
			setPan({ x: cx - nx * targetZoom, y: cy - ny * targetZoom });
		},
		[zoom, pan],
	);

	const exitReflectionMode = useCallback(() => {
		setZoom(reflectionMode.previousView.zoom);
		setPan(reflectionMode.previousView.pan);
		setReflectionMode({
			active: false,
			parentNodeId: null,
			previousView: { zoom: CANVAS.defaultZoom, pan: CANVAS.defaultPan },
		});
	}, [reflectionMode]);

	// ─────────────────────────────────────────────────────────────────────────
	// Planet interaction handlers
	// ─────────────────────────────────────────────────────────────────────────
	const handlePlanetMouseDown = useCallback(
		(node, e) => {
			if (e.shiftKey && tool === "select") {
				e.stopPropagation();
				setCreatingConnection(true);
				setConnectionSource(node);
				setConnectionPreview(null);
				return;
			}
			if (tool === "select") {
				e.stopPropagation();
				mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
				hasDraggedRef.current = false;
				setDraggingNodeId(node.id);
				const r = canvasRef.current.getBoundingClientRect();
				setDragOffset({
					x: e.clientX - r.left - node.position.x * zoom - pan.x,
					y: e.clientY - r.top - node.position.y * zoom - pan.y,
				});
			}
		},
		[tool, zoom, pan],
	);

	const handlePlanetClick = useCallback(
		(node, e) => {
			e.stopPropagation();

			// Ctrl/Cmd+click → toggle multi-select (for constellation ops)
			if ((e.ctrlKey || e.metaKey) && tool === "select") {
				if (node.type === "O" || node.type === "A" || node.type === "I") {
					setMultiSelectedIds((prev) => {
						const next = new Set(prev);
						if (next.has(node.id)) next.delete(node.id);
						else next.add(node.id);
						return next;
					});
					// Don't fire single-select when ctrl+clicking
					return;
				}
			}

			if (
				creatingConnection &&
				connectionSource &&
				node.id !== connectionSource.id
			) {
				createConnection(connectionSource, node);
				setCreatingConnection(false);
				setConnectionSource(null);
				setConnectionPreview(null);
				return;
			}

			if (tool === "select" && !hasDraggedRef.current) {
				if (node.type === "R") {
					const parent = nodes.find((n) => n.id === node.parentId);
					if (parent) enterReflectionMode(parent);
					return;
				}
				setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
				setMultiSelectedIds(new Set()); // clear multi-select on single click
			}
		},
		[tool, creatingConnection, connectionSource, nodes, enterReflectionMode],
	);

	const handlePlanetDoubleClick = useCallback(
		(node) => {
			if (node.type === "O" || node.type === "A" || node.type === "I") {
				enterReflectionMode(node);
			}
		},
		[enterReflectionMode],
	);

	const handlePlanetHover = useCallback(
		(node) => {
			setHoveredNodeId(node.id);
			if (pausedTimeRef.current === null) pausedTimeRef.current = orbitTime;
		},
		[orbitTime],
	);

	const handlePlanetLeave = useCallback(() => {
		setHoveredNodeId(null);
		pausedTimeRef.current = null;
	}, []);

	/** Right-click on a planet node */
	const handlePlanetContextMenu = useCallback(
		(node, e) => {
			e.preventDefault();
			e.stopPropagation();

			const memberOf = node.constellationIds || [];

			// Planet belongs to one or more constellations → offer membership management
			if (memberOf.length === 1) {
				setContextMenu({
					x: e.clientX,
					y: e.clientY,
					type: "planet-in-constellation",
					payload: { nodeId: node.id, constellationId: memberOf[0] },
				});
				return;
			}

			if (memberOf.length > 1) {
				setContextMenu({
					x: e.clientX,
					y: e.clientY,
					type: "planet-multi-constellation",
					payload: { nodeId: node.id, constellationIds: memberOf },
				});
				return;
			}

			// 2+ multi-selected and this node is among them
			if (multiSelectedIds.size >= 2 && multiSelectedIds.has(node.id)) {
				setContextMenu({
					x: e.clientX,
					y: e.clientY,
					type: "multi-select",
					payload: null,
				});
				return;
			}

			if (tool === "select") {
				setMultiSelectedIds((prev) => {
					const next = new Set(prev);
					next.add(node.id);
					return next;
				});
			}
		},
		[multiSelectedIds, tool],
	);

	const handleMoonClickOnCanvas = useCallback(
		(moon, e) => {
			e.stopPropagation();
			if (!hasDraggedRef.current && moon.parentId) {
				const parent = nodes.find((n) => n.id === moon.parentId);
				if (parent) enterReflectionMode(parent);
			}
		},
		[nodes, enterReflectionMode],
	);

	// ─────────────────────────────────────────────────────────────────────────
	// Connection creation
	// ─────────────────────────────────────────────────────────────────────────
	const createConnection = async (source, target) => {
		await db.edges.add({
			sourceId: source.id,
			targetId: target.id,
			type: "temporal",
			createdAt: Date.now(),
		});
		setEdges(await getAllEdges());
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Import / Export
	// ─────────────────────────────────────────────────────────────────────────
	const handleImport = useCallback(
		async (importedPurposeData) => {
			const [updatedNodes, updatedEdges, updatedConstellations] =
				await Promise.all([
					getAllNodes(),
					getAllEdges(),
					getAllConstellations(),
				]);
			setNodes(updatedNodes);
			setEdges(updatedEdges);
			setConstellations(updatedConstellations);
			setSelectedNodeId(null);
			setMultiSelectedIds(new Set());
			setConstellationEditor(null);
			setReflectionMode({
				active: false,
				parentNodeId: null,
				previousView: { zoom: CANVAS.defaultZoom, pan: CANVAS.defaultPan },
			});
			if (importedPurposeData) onPurposeUpdate?.(importedPurposeData);
		},
		[onPurposeUpdate],
	);

	const handleExport = useCallback(() => {
		const blob = new Blob(
			[
				JSON.stringify(
					{
						version: 4,
						exportedAt: new Date().toISOString(),
						purposeData,
						nodes,
						edges,
						constellations,
					},
					null,
					2,
				),
			],
			{ type: "application/json" },
		);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${purposeData?.title ? purposeData.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() : "chroma_map"}_${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}, [nodes, edges, constellations, purposeData]);

	// ─────────────────────────────────────────────────────────────────────────
	// Constellation handlers
	// ─────────────────────────────────────────────────────────────────────────

	/** Removes one node from a constellation (called from PlanetSidePanel). */
	const handleLeaveConstellation = useCallback(
		async (nodeId, constellationId) => {
			const { dissolved } = await removeNodeFromConstellation(
				nodeId,
				constellationId,
			);
			const [updatedNodes, updatedConstellations] = await Promise.all([
				getAllNodes(),
				getAllConstellations(),
			]);
			setNodes(updatedNodes);
			setConstellations(
				dissolved
					? updatedConstellations.filter((c) => c.id !== constellationId)
					: updatedConstellations,
			);
		},
		[],
	);

	/**
	 * Adds an existing node to an existing constellation (called from PlanetSidePanel).
	 * Appends nodeId to constellation.nodeIds and adds constellationId to node.constellationIds.
	 */
	const handleJoinConstellation = useCallback(
		async (nodeId, constellationId) => {
			const c = await db.constellations.get(constellationId);
			const node = await db.nodes.get(nodeId);
			if (!c || !node) return;

			if (!c.nodeIds.includes(nodeId)) {
				await db.constellations.update(constellationId, {
					nodeIds: [...c.nodeIds, nodeId],
				});
			}
			const currentIds = node.constellationIds || [];
			if (!currentIds.includes(constellationId)) {
				await db.nodes.update(nodeId, {
					constellationIds: [...currentIds, constellationId],
				});
			}

			const [updatedNodes, updatedConstellations] = await Promise.all([
				getAllNodes(),
				getAllConstellations(),
			]);
			setNodes(updatedNodes);
			setConstellations(updatedConstellations);
		},
		[],
	);
	const handleFormConstellation = useCallback(() => {
		if (multiSelectedIds.size < 2) return;
		const nodeIds = [...multiSelectedIds];

		const memberNodes = nodes.filter((n) => nodeIds.includes(n.id));
		const c = centroid(
			memberNodes.map((n) => ({
				x: n.position.x + planetConfig.baseRadius,
				y: n.position.y + planetConfig.baseRadius,
			})),
		);
		const screenX = c.x * zoom + pan.x;
		const screenY = c.y * zoom + pan.y;

		setContextMenu(null);
		setConstellationInput({ nodeIds, x: screenX, y: screenY, label: "" });
		setTimeout(() => labelInputRef.current?.focus(), 30);
	}, [multiSelectedIds, nodes, zoom, pan]);

	const handleConfirmConstellation = useCallback(async () => {
		if (!constellationInput || constellationInput.label.trim() === "") return;
		const id = await addConstellation({
			label: constellationInput.label,
			nodeIds: constellationInput.nodeIds,
		});
		const [updatedNodes, updatedConstellations] = await Promise.all([
			getAllNodes(),
			getAllConstellations(),
		]);
		setNodes(updatedNodes);
		setConstellations(updatedConstellations);
		setMultiSelectedIds(new Set());
		setConstellationInput(null);
	}, [constellationInput]);

	const handleCancelConstellation = useCallback(() => {
		setConstellationInput(null);
	}, []);

	/** Expands a collapsed constellation (click on nebula). */
	const handleExpandConstellation = useCallback(async (constellationId) => {
		await updateConstellation(constellationId, { collapsed: false });
		setConstellations((prev) =>
			prev.map((c) =>
				c.id === constellationId ? { ...c, collapsed: false } : c,
			),
		);
		setContextMenu(null);
	}, []);

	/** Collapses an expanded constellation (right-click → Collapse). */
	const handleCollapseConstellation = useCallback(async (constellationId) => {
		await updateConstellation(constellationId, { collapsed: true });
		setConstellations((prev) =>
			prev.map((c) =>
				c.id === constellationId ? { ...c, collapsed: true } : c,
			),
		);
		setContextMenu(null);
	}, []);

	/** Permanently dissolves a constellation. */
	const handleDissolveConstellation = useCallback(async (constellationId) => {
		if (
			!window.confirm(
				"Dissolve this constellation? Nodes will remain on the map independently.",
			)
		)
			return;
		await dissolveConstellation(constellationId);
		const [updatedNodes, updatedConstellations] = await Promise.all([
			getAllNodes(),
			getAllConstellations(),
		]);
		setNodes(updatedNodes);
		setConstellations(updatedConstellations);
		setContextMenu(null);
	}, []);

	/** Removes a single node from its constellation. */
	const handleRemoveFromConstellation = useCallback(
		async ({ nodeId, constellationId: cid }) => {
			const { dissolved } = await removeNodeFromConstellation(nodeId, cid);
			const [updatedNodes, updatedConstellations] = await Promise.all([
				getAllNodes(),
				getAllConstellations(),
			]);
			setNodes(updatedNodes);
			setConstellations(
				dissolved
					? updatedConstellations.filter((c) => c.id !== cid)
					: updatedConstellations,
			);
			setContextMenu(null);
		},
		[],
	);

	// ─────────────────────────────────────────────────────────────────────────
	// Derived rendering data
	// ─────────────────────────────────────────────────────────────────────────

	const collapsedConstellations = constellations.filter((c) => c.collapsed);
	const expandedConstellations = constellations.filter((c) => !c.collapsed);
	const collapsedIds = new Set(collapsedConstellations.map((c) => c.id));

	// A node is hidden only when ALL its constellations are collapsed
	// (multi-membership: if it belongs to both a collapsed and expanded one, stay visible)
	const hiddenNodeIds = new Set(
		nodes
			.filter((n) => {
				const ids = n.constellationIds || [];
				return ids.length > 0 && ids.every((cid) => collapsedIds.has(cid));
			})
			.map((n) => n.id),
	);

	const parentNodes = nodes.filter(
		(n) => n.type === "O" || n.type === "A" || n.type === "I",
	);
	// Only render planets that aren't swallowed by a collapsed nebula
	const visibleParentNodes = parentNodes.filter(
		(n) => !hiddenNodeIds.has(n.id),
	);

	const focusedParent = reflectionMode.active
		? nodes.find((n) => n.id === reflectionMode.parentNodeId)
		: null;
	const selectedNode = selectedNodeId
		? nodes.find((n) => n.id === selectedNodeId)
		: null;
	const isPlanetNode =
		selectedNode &&
		(selectedNode.type === "O" ||
			selectedNode.type === "A" ||
			selectedNode.type === "I");
	const selectedNodeMoons = isPlanetNode
		? nodes.filter((n) => n.parentId === selectedNode.id)
		: [];

	// ─────────────────────────────────────────────────────────────────────────
	// Render moons
	// ─────────────────────────────────────────────────────────────────────────
	const renderMoons = useCallback(() => {
		const moonParents = nodes.filter(
			(n) => n.type === "O" || n.type === "A" || n.type === "I",
		);
		const moonElements = [];

		moonParents.forEach((parent) => {
			// Don't render moons for planets inside collapsed constellations
			if (hiddenNodeIds.has(parent.id)) return;

			const childMoons = nodes.filter((n) => n.parentId === parent.id);
			const distributedMoons = distributeMoonsEvenly(childMoons, parent);
			const grouped = groupMoonsByDimension(childMoons, parent);
			const isHovered = hoveredNodeId === parent.id;
			const effectiveTime =
				isHovered && pausedTimeRef.current !== null
					? pausedTimeRef.current
					: orbitTime;

			// Orbit rings on hover
			if (isHovered && childMoons.length > 0) {
				getOrbitalPaths(parent).forEach((path) => {
					moonElements.push(
						<circle
							key={`${parent.id}-path-${path.dimension}`}
							cx={path.centerX}
							cy={path.centerY}
							r={path.radius * ORBIT_SCALE}
							fill="none"
							stroke={path.color}
							strokeWidth={2}
							strokeOpacity={0.5}
							strokeDasharray="5,5"
						/>,
					);
				});
			}

			Object.entries(grouped).forEach(([dimension, data]) => {
				if (data.count <= 0) return;
				if (data.count <= 3) {
					distributedMoons
						.filter((m) => m.dimension === dimension)
						.forEach((moon) => {
							const pos = calculateAnimatedOrbit(
								moon,
								parent,
								effectiveTime,
								false,
								dimension,
								ORBIT_SCALE,
							);
							moonElements.push(
								<Moon
									key={moon.id}
									node={moon}
									position={pos}
									count={1}
									isHovered={hoveredNodeId === moon.id}
									isSelected={selectedNodeId === moon.id}
									onClick={handleMoonClickOnCanvas}
									onMouseEnter={() => setHoveredNodeId(moon.id)}
									onMouseLeave={handlePlanetLeave}
								/>,
							);
						});
				} else {
					const firstMoon = data.moons[0];
					const distributed = distributedMoons.find(
						(m) => m.id === firstMoon.id,
					);
					const pos = distributed
						? calculateAnimatedOrbit(
								distributed,
								parent,
								effectiveTime,
								false,
								dimension,
								ORBIT_SCALE,
							)
						: data.position;
					const agg = {
						id: `${parent.id}-${dimension}`,
						type: "R",
						dimension,
						text: `${data.count} ${dimension} reflections`,
						position: pos,
						parentId: parent.id,
					};
					moonElements.push(
						<Moon
							key={agg.id}
							node={agg}
							position={pos}
							count={data.count}
							isHovered={hoveredNodeId === agg.id}
							isSelected={selectedNodeId === agg.id}
							onClick={handleMoonClickOnCanvas}
							onMouseEnter={() => setHoveredNodeId(agg.id)}
							onMouseLeave={handlePlanetLeave}
						/>,
					);
				}
			});
		});

		return moonElements;
	}, [
		nodes,
		hoveredNodeId,
		selectedNodeId,
		orbitTime,
		handleMoonClickOnCanvas,
		handlePlanetLeave,
		hiddenNodeIds,
	]);

	// ─────────────────────────────────────────────────────────────────────────
	// Render constellation hulls (expanded) + nebulae (collapsed)
	// ─────────────────────────────────────────────────────────────────────────

	const renderConstellationHulls = useCallback(() => {
		return expandedConstellations.map((c) => {
			const memberNodes = nodes.filter((n) => c.nodeIds.includes(n.id));
			if (memberNodes.length < 2) return null;

			const centers = memberNodes.map((n) => ({
				x: n.position.x + planetConfig.baseRadius,
				y: n.position.y + planetConfig.baseRadius,
			}));

			const padding = dynamicHullPadding(c.nodeIds, nodes);
			const hull = padHull(convexHull(centers), padding);
			if (hull.length < 2) return null;

			const pathD = hullToSvgPath(hull);
			const labelPos = centroid(hull);

			// Archetype badge
			const archetypeKey = c.archetype || "";
			const archetypeData = CONSTELLATION_ARCHETYPES[archetypeKey];

			return (
				<g key={`hull-${c.id}`}>
					<path
						d={pathD}
						fill={`${CONSTELLATION_COLOR}0.04)`}
						stroke={`${CONSTELLATION_COLOR}0.28)`}
						strokeWidth={2}
						strokeDasharray="6,4"
						pointerEvents="none"
					/>

					{/* Clickable label to open editor */}
					<g
						style={{ cursor: "pointer" }}
						onClick={(e) => {
							e.stopPropagation();
							setConstellationEditor({ constellationId: c.id });
						}}>
						<rect
							x={labelPos.x - 70}
							y={labelPos.y - padding * 0.55 - 12}
							width={140}
							height={22}
							rx={5}
							fill="rgba(10,15,28,0)"
							style={{ pointerEvents: "all" }}
						/>
						<text
							x={labelPos.x}
							y={labelPos.y - padding * 0.55}
							textAnchor="middle"
							fill={`${CONSTELLATION_COLOR}0.55)`}
							fontSize={11}
							fontFamily="system-ui, sans-serif"
							fontWeight={600}
							pointerEvents="none"
							style={{ userSelect: "none" }}>
							{archetypeData?.emoji ? `${archetypeData.emoji} ` : ""}
							{c.label}
						</text>
						{/* Edit hint */}
						<text
							x={labelPos.x}
							y={labelPos.y - padding * 0.55 + 14}
							textAnchor="middle"
							fill={`${CONSTELLATION_COLOR}0.25)`}
							fontSize={9}
							fontFamily="system-ui, sans-serif"
							pointerEvents="none"
							style={{ userSelect: "none" }}>
							click to edit
						</text>
					</g>
				</g>
			);
		});
	}, [expandedConstellations, nodes]);

	const renderConstellationNebulae = useCallback(() => {
		return collapsedConstellations.map((c) => {
			const memberNodes = nodes.filter((n) => c.nodeIds.includes(n.id));
			if (memberNodes.length === 0) return null;

			const centers = memberNodes.map((n) => ({
				x: n.position.x + planetConfig.baseRadius,
				y: n.position.y + planetConfig.baseRadius,
			}));
			const pos = centroid(centers);

			return (
				<ConstellationNebula
					key={`nebula-${c.id}`}
					constellation={c}
					position={pos}
					onClick={() => handleExpandConstellation(c.id)}
					onContextMenu={(e) =>
						setContextMenu({
							x: e.clientX,
							y: e.clientY,
							type: "nebula",
							payload: { constellationId: c.id },
						})
					}
				/>
			);
		});
	}, [collapsedConstellations, nodes, handleExpandConstellation]);

	// ─────────────────────────────────────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────────────────────────────────────
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				background: CANVAS.backgroundColor,
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}>
			<TopNav
				purposeData={purposeData}
				tool={tool}
				onToolChange={setTool}
				onExport={handleExport}
				onImport={handleImport}
			/>

			<div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
				<div
					ref={containerRef}
					onMouseDown={handleCanvasMouseDown}
					onMouseMove={handleCanvasMouseMove}
					onMouseUp={handleCanvasMouseUp}
					onMouseLeave={handleCanvasMouseUp}
					onDoubleClick={handleCanvasDoubleClick}
					onContextMenu={handleCanvasContextMenu}
					style={{
						flex: 1,
						position: "relative",
						cursor:
							tool === "hand"
								? isPanning
									? "grabbing"
									: "grab"
								: creatingConnection
									? "crosshair"
									: "default",
						overflow: "hidden",
						userSelect: "none",
					}}>
					<div
						ref={canvasRef}
						style={{
							width: "100%",
							height: "100%",
							position: "relative",
							backgroundImage: `radial-gradient(circle, rgba(30, 41, 59, ${CANVAS.gridOpacity}) 1px, transparent 1px)`,
							backgroundSize: `${CANVAS.gridSize * zoom}px ${CANVAS.gridSize * zoom}px`,
							backgroundPosition: `${pan.x}px ${pan.y}px`,
						}}>
						<svg
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: "100%",
								pointerEvents: "none",
							}}>
							<g
								transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
								style={{ pointerEvents: "auto" }}>
								{/* ── Constellation hull boundaries (expanded) ─────────────── */}
								{!reflectionMode.active && renderConstellationHulls()}

								{/* ── Edges ─────────────────────────────────────────────────── */}
								{edges.map((edge) => {
									const src = nodes.find((n) => n.id === edge.sourceId);
									const tgt = nodes.find((n) => n.id === edge.targetId);
									if (!src?.position || !tgt?.position) return null;
									return (
										<ConnectionLine
											key={edge.id}
											edge={edge}
											sourceNode={src}
											targetNode={tgt}
											isHovered={hoveredEdgeId === edge.id}
											onClick={handleEdgeClick}
											onMouseEnter={() => setHoveredEdgeId(edge.id)}
											onMouseLeave={() => setHoveredEdgeId(null)}
										/>
									);
								})}

								{/* ── Connection-in-progress preview line ───────────────────── */}
								{creatingConnection &&
									connectionSource &&
									connectionPreview && (
										<line
											x1={connectionSource.position.x + planetConfig.baseRadius}
											y1={connectionSource.position.y + planetConfig.baseRadius}
											x2={connectionPreview.x}
											y2={connectionPreview.y}
											stroke="#6C63FF"
											strokeWidth={2}
											strokeDasharray="5,5"
											opacity={0.6}
										/>
									)}

								{/* ── Multi-select rings (drawn behind planets) ─────────────── */}
								{!reflectionMode.active &&
									[...multiSelectedIds].map((nodeId) => {
										const node = nodes.find((n) => n.id === nodeId);
										if (!node) return null;
										return (
											<circle
												key={`ms-ring-${nodeId}`}
												cx={node.position.x + planetConfig.baseRadius}
												cy={node.position.y + planetConfig.baseRadius}
												r={planetConfig.baseRadius + 10}
												fill="none"
												stroke={`${CONSTELLATION_COLOR}0.55)`}
												strokeWidth={2}
												strokeDasharray="5,3"
												pointerEvents="none"
											/>
										);
									})}

								{/* ── Planets ───────────────────────────────────────────────── */}
								{visibleParentNodes.map((node) => (
									// Wrapper <g> gives us right-click on each planet without
									// modifying Planet.jsx
									<g
										key={`pw-${node.id}`}
										onContextMenu={(e) => handlePlanetContextMenu(node, e)}>
										<Planet
											node={node}
											moons={nodes.filter((n) => n.parentId === node.id)}
											isHovered={hoveredNodeId === node.id}
											isSelected={selectedNodeId === node.id}
											isFocused={
												reflectionMode.active
													? node.id === reflectionMode.parentNodeId
													: undefined
											}
											onClick={handlePlanetClick}
											onDoubleClick={handlePlanetDoubleClick}
											onMouseEnter={handlePlanetHover}
											onMouseLeave={handlePlanetLeave}
											onMouseDown={handlePlanetMouseDown}
										/>
									</g>
								))}

								{/* ── Moons ─────────────────────────────────────────────────── */}
								{!reflectionMode.active && renderMoons()}

								{/* ── Constellation nebulae (collapsed) ────────────────────── */}
								{!reflectionMode.active && renderConstellationNebulae()}
							</g>
						</svg>
					</div>

					{/* ── Reflection mode overlay ──────────────────────────────────────── */}
					{reflectionMode.active && focusedParent && (
						<ReflectionMode
							parentNode={focusedParent}
							nodes={nodes}
							onExit={exitReflectionMode}
							onNodesUpdate={async () => setNodes(await getAllNodes())}
						/>
					)}

					{/* ── Node type picker / text input ─────────────────────────────────── */}
					{showNodeTypePicker && (
						<NodeTypePicker
							position={nodeTypePickerPos}
							onSelect={handleNodeTypeSelect}
							onCancel={handleNodeInputCancel}
						/>
					)}
					{showNodeTextInput && (
						<NodeTextInput
							position={nodeTypePickerPos}
							nodeType={nodeTextInputType}
							onSave={handleNodeTextSave}
							onCancel={handleNodeInputCancel}
						/>
					)}

					{/* ── Constellation label input ─────────────────────────────────────── */}
					{constellationInput && (
						<div
							style={{
								position: "absolute",
								left: Math.min(constellationInput.x, window.innerWidth - 260),
								top: Math.min(
									constellationInput.y - 20,
									window.innerHeight - 130,
								),
								zIndex: 300,
								background: "#111827",
								border: "1px solid rgba(108,99,255,0.5)",
								borderRadius: 10,
								padding: "12px 14px",
								width: 240,
								boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
							}}>
							<p
								style={{
									color: "rgba(255,255,255,0.6)",
									fontSize: 11,
									margin: "0 0 8px",
									fontFamily: "system-ui, sans-serif",
								}}>
								✦ Name this constellation ({constellationInput.nodeIds.length}{" "}
								nodes)
							</p>
							<input
								ref={labelInputRef}
								value={constellationInput.label}
								onChange={(e) =>
									setConstellationInput((prev) => ({
										...prev,
										label: e.target.value,
									}))
								}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleConfirmConstellation();
									if (e.key === "Escape") handleCancelConstellation();
									e.stopPropagation(); // don't let Escape bubble to canvas handler twice
								}}
								placeholder="e.g. Morning standup arc"
								maxLength={50}
								style={{
									width: "100%",
									boxSizing: "border-box",
									background: "rgba(255,255,255,0.06)",
									border: "1px solid rgba(108,99,255,0.4)",
									borderRadius: 6,
									color: "white",
									fontSize: 13,
									padding: "6px 10px",
									outline: "none",
									fontFamily: "system-ui, sans-serif",
								}}
							/>
							<div style={{ display: "flex", gap: 8, marginTop: 10 }}>
								<button
									onClick={handleConfirmConstellation}
									disabled={!constellationInput.label.trim()}
									style={{
										flex: 1,
										padding: "6px 0",
										background: constellationInput.label.trim()
											? "rgba(108,99,255,0.8)"
											: "rgba(108,99,255,0.2)",
										border: "none",
										borderRadius: 6,
										color: "white",
										fontSize: 12,
										cursor: constellationInput.label.trim()
											? "pointer"
											: "default",
										fontFamily: "system-ui, sans-serif",
									}}>
									Create
								</button>
								<button
									onClick={handleCancelConstellation}
									style={{
										flex: 1,
										padding: "6px 0",
										background: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.1)",
										borderRadius: 6,
										color: "rgba(255,255,255,0.6)",
										fontSize: 12,
										cursor: "pointer",
										fontFamily: "system-ui, sans-serif",
									}}>
									Cancel
								</button>
							</div>
						</div>
					)}
				</div>

				{/* ── Planet side panel ──────────────────────────────────────────────── */}
				{isPlanetNode && !reflectionMode.active && (
					<PlanetSidePanel
						node={selectedNode}
						moons={selectedNodeMoons}
						constellations={constellations}
						onClose={() => setSelectedNodeId(null)}
						onOpenReflections={() => enterReflectionMode(selectedNode)}
						onNodesUpdate={async () => setNodes(await getAllNodes())}
						onLeaveConstellation={handleLeaveConstellation}
						onJoinConstellation={handleJoinConstellation}
					/>
				)}
			</div>

			{/* ── Context menu ────────────────────────────────────────────────────── */}
			{contextMenu && (
				<div
					style={{ ...menuStyle, left: contextMenu.x, top: contextMenu.y }}
					// Prevent canvas mousedown from immediately closing the menu
					onMouseDown={(e) => e.stopPropagation()}>
					{contextMenu.type === "multi-select" && (
						<button
							style={menuItemStyle}
							onClick={handleFormConstellation}
							onMouseEnter={(e) =>
								(e.currentTarget.style.background = "rgba(255,255,255,0.07)")
							}
							onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
							✦ Form Constellation&nbsp;
							<span style={{ opacity: 0.5 }}>
								({multiSelectedIds.size} nodes)
							</span>
						</button>
					)}

					{contextMenu.type === "nebula" && (
						<>
							<button
								style={menuItemStyle}
								onClick={() =>
									handleExpandConstellation(contextMenu.payload.constellationId)
								}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "rgba(255,255,255,0.07)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "none")
								}>
								◎ Expand constellation
							</button>
							<button
								style={menuItemStyle}
								onClick={() => {
									setConstellationEditor({
										constellationId: contextMenu.payload.constellationId,
									});
									setContextMenu(null);
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "rgba(255,255,255,0.07)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "none")
								}>
								✎ Edit constellation
							</button>
							<div style={menuDividerStyle} />
							<button
								style={menuItemDangerStyle}
								onClick={() =>
									handleDissolveConstellation(
										contextMenu.payload.constellationId,
									)
								}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "rgba(239,68,68,0.08)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "none")
								}>
								✕ Dissolve constellation
							</button>
						</>
					)}

					{contextMenu.type === "planet-in-constellation" && (
						<>
							<button
								style={menuItemStyle}
								onClick={() =>
									handleCollapseConstellation(
										contextMenu.payload.constellationId,
									)
								}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "rgba(255,255,255,0.07)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "none")
								}>
								◉ Collapse to nebula
							</button>
							<button
								style={menuItemStyle}
								onClick={() => {
									setConstellationEditor({
										constellationId: contextMenu.payload.constellationId,
									});
									setContextMenu(null);
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "rgba(255,255,255,0.07)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "none")
								}>
								✎ Edit constellation
							</button>
							<div style={menuDividerStyle} />
							<button
								style={menuItemDangerStyle}
								onClick={() =>
									handleRemoveFromConstellation(contextMenu.payload)
								}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "rgba(239,68,68,0.08)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "none")
								}>
								← Remove from constellation
							</button>
							<div style={menuDividerStyle} />
							<button
								style={menuItemDangerStyle}
								onClick={() =>
									handleDissolveConstellation(
										contextMenu.payload.constellationId,
									)
								}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "rgba(239,68,68,0.08)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "none")
								}>
								✕ Dissolve constellation
							</button>
						</>
					)}

					{contextMenu.type === "planet-multi-constellation" &&
						(() => {
							const cids = contextMenu.payload.constellationIds;
							return (
								<>
									<p
										style={{
											margin: "4px 14px 6px",
											fontSize: 10,
											color: "rgba(255,255,255,0.3)",
											textTransform: "uppercase",
											letterSpacing: "0.06em",
										}}>
										In {cids.length} constellations
									</p>
									{cids.map((cid) => {
										const c = constellations.find((x) => x.id === cid);
										if (!c) return null;
										return (
											<button
												key={cid}
												style={menuItemStyle}
												onClick={() =>
													handleRemoveFromConstellation({
														nodeId: contextMenu.payload.nodeId,
														constellationId: cid,
													})
												}
												onMouseEnter={(e) =>
													(e.currentTarget.style.background =
														"rgba(239,68,68,0.08)")
												}
												onMouseLeave={(e) =>
													(e.currentTarget.style.background = "none")
												}>
												← Leave "{c.label}"
											</button>
										);
									})}
								</>
							);
						})()}
				</div>
			)}

			{/* ── Edge editor popup ────────────────────────────────────────────────── */}
			{edgePopup && (
				<div
					style={{
						...menuStyle,
						left: Math.min(edgePopup.x, window.innerWidth - 220),
						top: Math.min(edgePopup.y - 10, window.innerHeight - 280),
						width: 210,
						padding: "10px 0 6px",
					}}
					onMouseDown={(e) => e.stopPropagation()}>
					{/* Type picker */}
					<p
						style={{
							margin: "0 12px 6px",
							fontSize: 10,
							fontWeight: 700,
							color: "rgba(255,255,255,0.3)",
							textTransform: "uppercase",
							letterSpacing: "0.06em",
						}}>
						Connection type
					</p>
					{Object.entries(CONNECTION_TYPES).map(([key, cfg]) => {
						const EDGE_TYPE_ALIASES = {
							temporal: "followed",
							causal: "caused",
							"intention-action": "triggered",
							"intention-pattern": "enabled",
						};
						const resolvedType =
							EDGE_TYPE_ALIASES[edgePopup.edge.type] ||
							edgePopup.edge.type ||
							"followed";
						const isActive = resolvedType === key;
						return (
							<button
								key={key}
								onClick={() => handleEdgeTypeChange(key)}
								style={{
									...menuItemStyle,
									display: "flex",
									alignItems: "center",
									gap: 8,
									padding: "6px 12px",
									background: isActive ? "rgba(108,99,255,0.18)" : "none",
									color: isActive ? "#A78BFA" : "rgba(255,255,255,0.75)",
								}}
								onMouseEnter={(e) => {
									if (!isActive)
										e.currentTarget.style.background = "rgba(255,255,255,0.06)";
								}}
								onMouseLeave={(e) => {
									if (!isActive) e.currentTarget.style.background = "none";
								}}>
								<span
									style={{
										width: 8,
										height: 8,
										borderRadius: "50%",
										background: cfg.dotColor,
										flexShrink: 0,
									}}
								/>
								{cfg.label}
								{isActive && (
									<span
										style={{ marginLeft: "auto", fontSize: 10, opacity: 0.5 }}>
										✓
									</span>
								)}
							</button>
						);
					})}

					{/* Custom label */}
					<div
						style={{
							borderTop: "1px solid rgba(255,255,255,0.07)",
							margin: "6px 0 4px",
						}}
					/>
					<p
						style={{
							margin: "4px 12px 5px",
							fontSize: 10,
							fontWeight: 700,
							color: "rgba(255,255,255,0.3)",
							textTransform: "uppercase",
							letterSpacing: "0.06em",
						}}>
						Custom label
					</p>
					<div style={{ padding: "0 10px 6px", display: "flex", gap: 6 }}>
						<input
							value={edgePopup.labelDraft}
							onChange={(e) =>
								setEdgePopup((prev) =>
									prev ? { ...prev, labelDraft: e.target.value } : null,
								)
							}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleEdgeLabelSave();
								if (e.key === "Escape") setEdgePopup(null);
								e.stopPropagation();
							}}
							placeholder="e.g. triggered"
							maxLength={40}
							style={{
								flex: 1,
								background: "rgba(255,255,255,0.06)",
								border: "1px solid rgba(108,99,255,0.3)",
								borderRadius: 5,
								color: "white",
								fontSize: 12,
								padding: "5px 8px",
								outline: "none",
								fontFamily: "system-ui, sans-serif",
							}}
						/>
						<button
							onClick={handleEdgeLabelSave}
							style={{
								padding: "5px 10px",
								background: "rgba(108,99,255,0.7)",
								border: "none",
								borderRadius: 5,
								color: "white",
								fontSize: 12,
								cursor: "pointer",
							}}>
							Set
						</button>
					</div>

					{/* Delete */}
					<div
						style={{
							borderTop: "1px solid rgba(255,255,255,0.07)",
							margin: "4px 0 0",
						}}
					/>
					<button
						onClick={handleEdgeDelete}
						style={{
							...menuItemDangerStyle,
							padding: "7px 12px",
							display: "flex",
							alignItems: "center",
							gap: 6,
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.background = "rgba(239,68,68,0.08)")
						}
						onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
						✕ Remove connection
					</button>
				</div>
			)}
			{/* ── Constellation editor panel ───────────────────────────────────────── */}
			{constellationEditor &&
				(() => {
					const c = constellations.find(
						(x) => x.id === constellationEditor.constellationId,
					);
					if (!c) return null;

					const save = async (updates) => {
						await updateConstellation(c.id, updates);
						setConstellations((prev) =>
							prev.map((x) => (x.id === c.id ? { ...x, ...updates } : x)),
						);
					};

					return (
						<div
							style={{
								position: "fixed",
								top: 60,
								right: 0,
								width: 300,
								bottom: 0,
								background: "rgba(10,15,28,0.98)",
								borderLeft: "1px solid rgba(108,99,255,0.2)",
								zIndex: 400,
								display: "flex",
								flexDirection: "column",
								padding: "20px 18px",
								gap: 18,
								overflowY: "auto",
							}}
							onMouseDown={(e) => e.stopPropagation()}>
							{/* Header */}
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
								}}>
								<div>
									<p
										style={{
											margin: 0,
											fontSize: 10,
											color: "rgba(108,99,255,0.7)",
											textTransform: "uppercase",
											letterSpacing: "0.08em",
											fontWeight: 700,
										}}>
										Constellation
									</p>
									<p
										style={{
											margin: "2px 0 0",
											fontSize: 14,
											color: "#E2E8F0",
											fontWeight: 600,
										}}>
										{c.label}
									</p>
								</div>
								<button
									onClick={() => setConstellationEditor(null)}
									style={{
										background: "none",
										border: "none",
										color: "rgba(255,255,255,0.35)",
										cursor: "pointer",
										fontSize: 18,
										padding: "0 2px",
									}}>
									✕
								</button>
							</div>

							{/* Label */}
							<div>
								<label
									style={{
										fontSize: 10,
										color: "rgba(255,255,255,0.35)",
										textTransform: "uppercase",
										letterSpacing: "0.06em",
										fontWeight: 700,
									}}>
									Name
								</label>
								<input
									defaultValue={c.label}
									onBlur={(e) =>
										save({ label: e.target.value.trim() || c.label })
									}
									onKeyDown={(e) => {
										if (e.key === "Enter") e.target.blur();
										e.stopPropagation();
									}}
									maxLength={50}
									style={{
										display: "block",
										width: "100%",
										boxSizing: "border-box",
										marginTop: 6,
										background: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(108,99,255,0.3)",
										borderRadius: 6,
										color: "white",
										fontSize: 13,
										padding: "7px 10px",
										outline: "none",
										fontFamily: "system-ui, sans-serif",
									}}
								/>
							</div>

							{/* Note */}
							<div>
								<label
									style={{
										fontSize: 10,
										color: "rgba(255,255,255,0.35)",
										textTransform: "uppercase",
										letterSpacing: "0.06em",
										fontWeight: 700,
									}}>
									What patterns do you recognize across these events? What does
									this arc reveal about how you tend to respond?
								</label>
								<textarea
									defaultValue={c.note || ""}
									onBlur={(e) => save({ note: e.target.value })}
									onKeyDown={(e) => e.stopPropagation()}
									placeholder="Write what this sequence means as a whole — the insight, not the events..."
									rows={5}
									style={{
										display: "block",
										width: "100%",
										boxSizing: "border-box",
										marginTop: 6,
										background: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(108,99,255,0.3)",
										borderRadius: 6,
										color: "white",
										fontSize: 12,
										padding: "8px 10px",
										outline: "none",
										fontFamily: "system-ui, sans-serif",
										resize: "vertical",
										lineHeight: 1.5,
										color: "rgba(255,255,255,0.85)",
									}}
								/>
							</div>

							{/* Archetype */}
							<div>
								<label
									style={{
										fontSize: 10,
										color: "rgba(255,255,255,0.35)",
										textTransform: "uppercase",
										letterSpacing: "0.06em",
										fontWeight: 700,
									}}>
									Arc type
								</label>
								<div
									style={{
										display: "flex",
										flexWrap: "wrap",
										gap: 6,
										marginTop: 8,
									}}>
									{Object.entries(CONSTELLATION_ARCHETYPES).map(
										([key, { label, emoji }]) => {
											const active = (c.archetype || "") === key;
											return (
												<button
													key={key}
													onClick={() => save({ archetype: key })}
													style={{
														padding: "5px 10px",
														background: active
															? "rgba(108,99,255,0.35)"
															: "rgba(255,255,255,0.05)",
														border: `1px solid ${active ? "rgba(108,99,255,0.6)" : "rgba(255,255,255,0.1)"}`,
														borderRadius: 20,
														color: active ? "#C4B5FD" : "rgba(255,255,255,0.5)",
														fontSize: 12,
														cursor: "pointer",
														fontFamily: "system-ui, sans-serif",
														whiteSpace: "nowrap",
													}}>
													{emoji ? `${emoji} ` : ""}
													{label}
												</button>
											);
										},
									)}
								</div>
							</div>

							{/* Meta */}
							<div
								style={{
									marginTop: "auto",
									paddingTop: 12,
									borderTop: "1px solid rgba(255,255,255,0.06)",
								}}>
								<p
									style={{
										margin: 0,
										fontSize: 11,
										color: "rgba(255,255,255,0.2)",
									}}>
									{c.nodeIds.length} {c.nodeIds.length === 1 ? "node" : "nodes"}{" "}
									· created {new Date(c.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					);
				})()}
		</div>
	);
}
