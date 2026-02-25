// src/components/SpaceCanvas.jsx - V3.4
// Fixes in this version:
//   1. Edge deletion — hover highlights the line, click confirms + deletes from DB
//   2. handlePlanetDoubleClick dep array now includes enterReflectionMode (was [])
//   3. Moon clicks on canvas open parent in reflection mode
//   4. Hover orbit rings scaled by ORBIT_SCALE
//   5. onImport prop wired through for post-import state reload
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
	db,
	initializeDB,
	getAllNodes,
	getAllEdges,
	getUnlockedDimensions,
	deleteEdge,
} from "../lib/db";
import {
	groupMoonsByDimension,
	distributeMoonsEvenly,
	calculateAnimatedOrbit,
	getOrbitalPaths,
} from "../lib/orbitalPhysics";
import { planetConfig, moonConfig } from "../seedData";
import Planet from "./Planet";
import Moon from "./Moon";
import ConnectionLine from "./ConnectionLine";
import ReflectionMode from "./ReflectionMode";
import NodeTypePicker from "./NodeTypePicker";
import NodeTextInput from "./NodeTextInput";
import TopNav from "./TopNav";
import PlanetSidePanel from "./PlanetSidePanel";
import { CANVAS } from "../utils/constants";

const DRAG_THRESHOLD = 4;
const ORBIT_SCALE = 0.62;

export default function SpaceCanvas({ purposeData, onPurposeUpdate }) {
	const [nodes, setNodes] = useState([]);
	const [edges, setEdges] = useState([]);
	const [selectedNodeId, setSelectedNodeId] = useState(null);
	const [hoveredNodeId, setHoveredNodeId] = useState(null);
	const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
	const [unlockedDimensions, setUnlockedDimensions] = useState([]);

	const [zoom, setZoom] = useState(CANVAS.defaultZoom);
	const [pan, setPan] = useState(CANVAS.defaultPan);
	const [isPanning, setIsPanning] = useState(false);
	const [panStart, setPanStart] = useState({ x: 0, y: 0 });
	const [tool, setTool] = useState("select");

	const [draggingNodeId, setDraggingNodeId] = useState(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const hasDraggedRef = useRef(false);
	const mouseDownPosRef = useRef({ x: 0, y: 0 });

	const [showNodeTypePicker, setShowNodeTypePicker] = useState(false);
	const [nodeTypePickerPos, setNodeTypePickerPos] = useState({ x: 0, y: 0 });
	const [showNodeTextInput, setShowNodeTextInput] = useState(false);
	const [nodeTextInputType, setNodeTextInputType] = useState(null);
	const [nodeCreationPos, setNodeCreationPos] = useState({ x: 0, y: 0 });

	const [creatingConnection, setCreatingConnection] = useState(false);
	const [connectionSource, setConnectionSource] = useState(null);
	const [connectionPreview, setConnectionPreview] = useState(null);

	const [reflectionMode, setReflectionMode] = useState({
		active: false,
		parentNodeId: null,
		previousView: { zoom: CANVAS.defaultZoom, pan: CANVAS.defaultPan },
	});

	const [orbitTime, setOrbitTime] = useState(0);
	const animationFrameRef = useRef();
	const lastTimestampRef = useRef(null);
	const pausedTimeRef = useRef(null);

	const canvasRef = useRef(null);
	const containerRef = useRef(null);

	// ── Load ───────────────────────────────────────────────────────────────────
	useEffect(() => {
		async function loadData() {
			await initializeDB();
			setNodes(await getAllNodes());
			setEdges(await getAllEdges());
		}
		loadData();
	}, []);

	const moonCount = nodes.filter((n) => n.type === "R").length;
	useEffect(() => {
		getUnlockedDimensions().then(setUnlockedDimensions);
	}, [moonCount]);

	// ── Animation ──────────────────────────────────────────────────────────────
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

	// ── Wheel zoom ─────────────────────────────────────────────────────────────
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

	// ── Canvas mouse ───────────────────────────────────────────────────────────
	const handleCanvasMouseDown = (e) => {
		if (e.shiftKey && tool === "select") return;
		if (
			tool === "select" &&
			(e.target === containerRef.current || e.target === canvasRef.current)
		) {
			setSelectedNodeId(null);
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

	// ── Node creation ──────────────────────────────────────────────────────────
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

	// ── Edge deletion ──────────────────────────────────────────────────────────
	const handleEdgeClick = useCallback(async (edge) => {
		if (
			!window.confirm(
				"Remove this connection? Both planets stay — only the link is removed.",
			)
		)
			return;
		await deleteEdge(edge.id);
		setEdges((prev) => prev.filter((e) => e.id !== edge.id));
	}, []);

	// ── Keyboard ───────────────────────────────────────────────────────────────
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
			if (e.key === "Escape" && reflectionMode.active) exitReflectionMode();
			if (e.key === "Escape" && creatingConnection) {
				setCreatingConnection(false);
				setConnectionSource(null);
				setConnectionPreview(null);
			}
			if (e.key === "Escape" && (showNodeTypePicker || showNodeTextInput))
				handleNodeInputCancel();
			if (e.key === "Escape" && selectedNodeId) setSelectedNodeId(null);
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
	]);

	// ── Reflection mode ────────────────────────────────────────────────────────
	const enterReflectionMode = useCallback(
		(parentNode) => {
			const targetZoom = 2.5;
			const cx = window.innerWidth / 2;
			const cy = (window.innerHeight - 60) / 2 + 60;
			const nx = parentNode.position.x + planetConfig.baseRadius;
			const ny = parentNode.position.y + planetConfig.baseRadius;
			setSelectedNodeId(null);
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

	// ── Planet handlers ────────────────────────────────────────────────────────
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
			}
		},
		[tool, creatingConnection, connectionSource, nodes, enterReflectionMode],
	);

	// FIX: dependency array includes enterReflectionMode to avoid stale closure
	const handlePlanetDoubleClick = useCallback(
		(node) => {
			if (node.type === "O" || node.type === "A" || node.type === "I")
				enterReflectionMode(node);
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

	// ── Connection ─────────────────────────────────────────────────────────────
	const createConnection = async (source, target) => {
		await db.edges.add({
			sourceId: source.id,
			targetId: target.id,
			type: "temporal",
			createdAt: Date.now(),
		});
		setEdges(await getAllEdges());
	};

	// ── Import / Export ────────────────────────────────────────────────────────
	const handleImport = useCallback(
		async (importedPurposeData) => {
			setNodes(await getAllNodes());
			setEdges(await getAllEdges());
			setSelectedNodeId(null);
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
						version: 3,
						exportedAt: new Date().toISOString(),
						purposeData,
						nodes,
						edges,
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
	}, [nodes, edges, purposeData]);

	// ── Render moons ───────────────────────────────────────────────────────────
	const renderMoons = useCallback(() => {
		const parentNodes = nodes.filter(
			(n) => n.type === "O" || n.type === "A" || n.type === "I",
		);
		const moonElements = [];

		parentNodes.forEach((parent) => {
			const childMoons = nodes.filter((n) => n.parentId === parent.id);
			const distributedMoons = distributeMoonsEvenly(childMoons, parent);
			const grouped = groupMoonsByDimension(childMoons, parent);
			const isHovered = hoveredNodeId === parent.id;
			const effectiveTime =
				isHovered && pausedTimeRef.current !== null
					? pausedTimeRef.current
					: orbitTime;

			// Hover orbit rings scaled to actual moon positions
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
	]);

	// ── Render ─────────────────────────────────────────────────────────────────
	const parentNodes = nodes.filter(
		(n) => n.type === "O" || n.type === "A" || n.type === "I",
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
								{/* Edges — hoverable + deletable */}
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

								{parentNodes.map((node) => (
									<Planet
										key={node.id}
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
								))}

								{!reflectionMode.active && renderMoons()}
							</g>
						</svg>
					</div>

					{reflectionMode.active && focusedParent && (
						<ReflectionMode
							parentNode={focusedParent}
							nodes={nodes}
							onExit={exitReflectionMode}
							onNodesUpdate={async () => setNodes(await getAllNodes())}
						/>
					)}

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
				</div>

				{isPlanetNode && !reflectionMode.active && (
					<PlanetSidePanel
						node={selectedNode}
						moons={selectedNodeMoons}
						onClose={() => setSelectedNodeId(null)}
						onOpenReflections={() => enterReflectionMode(selectedNode)}
						onNodesUpdate={async () => setNodes(await getAllNodes())}
					/>
				)}
			</div>
		</div>
	);
}
