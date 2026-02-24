// src/components/SpaceCanvas.jsx - V3.2
// Key fix: hasDraggedRef tracks whether mouse moved during mousedown,
// so single click always selects even though draggingNodeId is set on mousedown.
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
	db,
	initializeDB,
	getAllNodes,
	getAllEdges,
	getUnlockedDimensions,
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
import PlanetSidePanel, { PLANET_PANEL_WIDTH } from "./PlanetSidePanel";
import { CANVAS } from "../utils/constants";

const DRAG_THRESHOLD = 4; // px — below this is a click, not a drag
const ORBIT_SCALE = 0.62; // Reduce orbit radii from seedData defaults

export default function SpaceCanvas({ purposeData }) {
	const [nodes, setNodes] = useState([]);
	const [edges, setEdges] = useState([]);
	const [selectedNodeId, setSelectedNodeId] = useState(null);
	const [hoveredNodeId, setHoveredNodeId] = useState(null);
	const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
	const [unlockedDimensions, setUnlockedDimensions] = useState([]);

	// Pan/Zoom
	const [zoom, setZoom] = useState(CANVAS.defaultZoom);
	const [pan, setPan] = useState(CANVAS.defaultPan);
	const [isPanning, setIsPanning] = useState(false);
	const [panStart, setPanStart] = useState({ x: 0, y: 0 });
	const [tool, setTool] = useState("select");

	// Dragging
	const [draggingNodeId, setDraggingNodeId] = useState(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	// Tracks whether the mouse actually moved enough to count as a drag
	const hasDraggedRef = useRef(false);
	const mouseDownPosRef = useRef({ x: 0, y: 0 });

	// Node creation
	const [showNodeTypePicker, setShowNodeTypePicker] = useState(false);
	const [nodeTypePickerPos, setNodeTypePickerPos] = useState({ x: 0, y: 0 });
	const [showNodeTextInput, setShowNodeTextInput] = useState(false);
	const [nodeTextInputType, setNodeTextInputType] = useState(null);
	const [nodeCreationPos, setNodeCreationPos] = useState({ x: 0, y: 0 });

	// Connection creation
	const [creatingConnection, setCreatingConnection] = useState(false);
	const [connectionSource, setConnectionSource] = useState(null);
	const [connectionPreview, setConnectionPreview] = useState(null);

	// Reflection mode
	const [reflectionMode, setReflectionMode] = useState({
		active: false,
		parentNodeId: null,
		previousView: { zoom: CANVAS.defaultZoom, pan: CANVAS.defaultPan },
	});

	// Animation — frame-rate independent
	const [orbitTime, setOrbitTime] = useState(0);
	const animationFrameRef = useRef();
	const lastTimestampRef = useRef(null);
	const pausedTimeRef = useRef(null);

	const canvasRef = useRef(null);
	const containerRef = useRef(null);

	// ── Load data ─────────────────────────────────────────────────────────────
	useEffect(() => {
		async function loadData() {
			await initializeDB();
			const loadedNodes = await getAllNodes();
			const loadedEdges = await getAllEdges();
			setNodes(loadedNodes);
			setEdges(loadedEdges);
		}
		loadData();
	}, []);

	useEffect(() => {
		async function loadUnlocked() {
			const unlocked = await getUnlockedDimensions();
			setUnlockedDimensions(unlocked);
		}
		loadUnlocked();
	}, [nodes]);

	// ── Orbit animation ───────────────────────────────────────────────────────
	useEffect(() => {
		const animate = (timestamp) => {
			if (!reflectionMode.active) {
				if (lastTimestampRef.current !== null) {
					const delta = Math.min(timestamp - lastTimestampRef.current, 100);
					if (!hoveredNodeId) {
						setOrbitTime((prev) => prev + delta / 16.667);
					}
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

	// ── Wheel zoom ────────────────────────────────────────────────────────────
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

	// ── Canvas mouse handlers ─────────────────────────────────────────────────
	const handleCanvasMouseDown = (e) => {
		if (e.shiftKey && tool === "select") return;

		if (
			tool === "select" &&
			(e.target === containerRef.current || e.target === canvasRef.current)
		) {
			// Single click: just deselect. Double-click opens the node picker.
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
		if (isPanning) {
			setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
		}

		if (creatingConnection && connectionSource) {
			const canvasRect = canvasRef.current.getBoundingClientRect();
			setConnectionPreview({
				x: (e.clientX - canvasRect.left - pan.x) / zoom,
				y: (e.clientY - canvasRect.top - pan.y) / zoom,
			});
		}

		if (draggingNodeId && canvasRef.current) {
			// Check if we've moved past drag threshold
			const dx = e.clientX - mouseDownPosRef.current.x;
			const dy = e.clientY - mouseDownPosRef.current.y;
			if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
				hasDraggedRef.current = true;
			}

			const canvasRect = canvasRef.current.getBoundingClientRect();
			const newX = (e.clientX - canvasRect.left - dragOffset.x - pan.x) / zoom;
			const newY = (e.clientY - canvasRect.top - dragOffset.y - pan.y) / zoom;
			setNodes((prevNodes) =>
				prevNodes.map((n) =>
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
		if (!canvasRef.current) return;
		const canvasRect = canvasRef.current.getBoundingClientRect();
		const worldX =
			(e.clientX - canvasRect.left - pan.x) / zoom - planetConfig.baseRadius;
		const worldY =
			(e.clientY - canvasRect.top - pan.y) / zoom - planetConfig.baseRadius;
		setNodeCreationPos({ x: worldX, y: worldY });
		setNodeTypePickerPos({ x: e.clientX, y: e.clientY });
		setShowNodeTypePicker(true);
	};

	const handleCanvasMouseUp = async () => {
		setIsPanning(false);

		if (draggingNodeId) {
			if (hasDraggedRef.current) {
				// Save new position only if actually dragged
				const node = nodes.find((n) => n.id === draggingNodeId);
				if (node) {
					await db.nodes.update(node.id, { position: node.position });
				}
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

	// ── Node creation ─────────────────────────────────────────────────────────
	const handleNodeTypeSelect = (type) => {
		setNodeTextInputType(type);
		setShowNodeTypePicker(false);
		setShowNodeTextInput(true);
	};

	const handleNodeTextSave = async (text) => {
		const newNode = {
			type: nodeTextInputType,
			text,
			timestamp: Date.now(),
			state: "present",
			position: nodeCreationPos,
		};
		await db.nodes.add(newNode);
		const updated = await getAllNodes();
		setNodes(updated);
		setShowNodeTextInput(false);
		setNodeTextInputType(null);
	};

	const handleNodeInputCancel = () => {
		setShowNodeTypePicker(false);
		setShowNodeTextInput(false);
		setNodeTextInputType(null);
	};

	// ── Keyboard shortcuts ────────────────────────────────────────────────────
	useEffect(() => {
		const handleKeyDown = (e) => {
			const isTyping =
				document.activeElement?.tagName === "INPUT" ||
				document.activeElement?.tagName === "TEXTAREA" ||
				document.activeElement?.isContentEditable;

			if (e.key === " " && !e.repeat && tool === "select" && !isTyping) {
				e.preventDefault();
				setTool("hand");
			}
			if (e.key === "Escape" && reflectionMode.active) exitReflectionMode();
			if (e.key === "Escape" && creatingConnection) {
				setCreatingConnection(false);
				setConnectionSource(null);
				setConnectionPreview(null);
			}
			if (e.key === "Escape" && (showNodeTypePicker || showNodeTextInput)) {
				handleNodeInputCancel();
			}
			if (e.key === "Escape" && selectedNodeId) {
				setSelectedNodeId(null);
			}
		};

		const handleKeyUp = (e) => {
			const isTyping =
				document.activeElement?.tagName === "INPUT" ||
				document.activeElement?.tagName === "TEXTAREA" ||
				document.activeElement?.isContentEditable;
			if (e.key === " " && tool === "hand" && !isTyping) setTool("select");
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [
		tool,
		reflectionMode.active,
		creatingConnection,
		showNodeTypePicker,
		showNodeTextInput,
		selectedNodeId,
	]);

	// ── Planet interactions ───────────────────────────────────────────────────
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
				// Record where mousedown started and reset drag flag
				mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
				hasDraggedRef.current = false;
				setDraggingNodeId(node.id);
				const canvasRect = canvasRef.current.getBoundingClientRect();
				setDragOffset({
					x: e.clientX - canvasRect.left - node.position.x * zoom - pan.x,
					y: e.clientY - canvasRect.top - node.position.y * zoom - pan.y,
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

			// Only select if this was a clean click (not end of a drag)
			if (tool === "select" && !hasDraggedRef.current) {
				setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
			}
		},
		[tool, creatingConnection, connectionSource],
	);

	const handlePlanetDoubleClick = useCallback(
		(node) => {
			if (node.type === "O" || node.type === "A" || node.type === "I") {
				enterReflectionMode(node);
			}
		},
		// enterReflectionMode is stable via useCallback below
		[],
	);

	const handlePlanetHover = useCallback(
		(node) => {
			setHoveredNodeId(node.id);
			if (pausedTimeRef.current === null) {
				pausedTimeRef.current = orbitTime;
			}
		},
		[orbitTime],
	);

	const handlePlanetLeave = useCallback(() => {
		setHoveredNodeId(null);
		pausedTimeRef.current = null;
	}, []);

	// ── Connection creation ───────────────────────────────────────────────────
	const createConnection = async (source, target) => {
		const newEdge = {
			sourceId: source.id,
			targetId: target.id,
			type: "temporal",
			createdAt: Date.now(),
		};
		await db.edges.add(newEdge);
		const updatedEdges = await getAllEdges();
		setEdges(updatedEdges);
	};

	// ── Reflection mode ───────────────────────────────────────────────────────
	const enterReflectionMode = useCallback(
		(parentNode) => {
			const targetZoom = 2.5;
			const viewportCenterX = window.innerWidth / 2;
			const viewportCenterY = (window.innerHeight - 60) / 2 + 60;
			const nodeCenterX = parentNode.position.x + planetConfig.baseRadius;
			const nodeCenterY = parentNode.position.y + planetConfig.baseRadius;
			const targetPanX = viewportCenterX - nodeCenterX * targetZoom;
			const targetPanY = viewportCenterY - nodeCenterY * targetZoom;

			setSelectedNodeId(null);
			setReflectionMode({
				active: true,
				parentNodeId: parentNode.id,
				previousView: { zoom, pan },
			});
			setZoom(targetZoom);
			setPan({ x: targetPanX, y: targetPanY });
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

	// ── Export ────────────────────────────────────────────────────────────────
	const handleExport = useCallback(() => {
		const exportData = {
			version: 3,
			exportedAt: new Date().toISOString(),
			purposeData,
			nodes,
			edges,
		};
		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		const title = purposeData?.title
			? purposeData.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()
			: "chroma_map";
		a.download = `${title}_${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}, [nodes, edges, purposeData]);

	// ── Render moons ──────────────────────────────────────────────────────────
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

			if (isHovered && childMoons.length > 0) {
				getOrbitalPaths(parent).forEach((path) => {
					moonElements.push(
						<circle
							key={`${parent.id}-path-${path.dimension}`}
							cx={path.centerX}
							cy={path.centerY}
							r={path.radius}
							fill="none"
							stroke={path.color}
							strokeWidth={2}
							strokeOpacity={0.25}
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
									onClick={handlePlanetClick}
									onMouseEnter={handlePlanetHover}
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

					const aggregateNode = {
						id: `${parent.id}-${dimension}`,
						type: "R",
						dimension,
						text: `${data.count} ${dimension} reflections`,
						position: pos,
						parentId: parent.id,
					};

					moonElements.push(
						<Moon
							key={aggregateNode.id}
							node={aggregateNode}
							position={pos}
							count={data.count}
							isHovered={hoveredNodeId === aggregateNode.id}
							isSelected={selectedNodeId === aggregateNode.id}
							onClick={handlePlanetClick}
							onMouseEnter={handlePlanetHover}
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
		handlePlanetClick,
		handlePlanetHover,
		handlePlanetLeave,
	]);

	// ── Render ────────────────────────────────────────────────────────────────
	const parentNodes = nodes.filter(
		(n) => n.type === "O" || n.type === "A" || n.type === "I",
	);
	const focusedParent = reflectionMode.active
		? nodes.find((n) => n.id === reflectionMode.parentNodeId)
		: null;

	const selectedNode = selectedNodeId
		? nodes.find((n) => n.id === selectedNodeId)
		: null;
	const selectedNodeMoons = selectedNode
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
			/>

			{/* Canvas row + optional planet panel */}
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
								{edges.map((edge) => {
									const sourceNode = nodes.find((n) => n.id === edge.sourceId);
									const targetNode = nodes.find((n) => n.id === edge.targetId);
									if (!sourceNode?.position || !targetNode?.position)
										return null;
									return (
										<ConnectionLine
											key={edge.id}
											edge={edge}
											sourceNode={sourceNode}
											targetNode={targetNode}
											isHovered={hoveredEdgeId === edge.id}
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
							onNodesUpdate={async () => {
								const updated = await getAllNodes();
								setNodes(updated);
							}}
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

				{/* Planet side panel — single click on planet shows this */}
				{selectedNode && !reflectionMode.active && (
					<PlanetSidePanel
						node={selectedNode}
						moons={selectedNodeMoons}
						onClose={() => setSelectedNodeId(null)}
						onOpenReflections={() => enterReflectionMode(selectedNode)}
						onNodesUpdate={async () => {
							const updated = await getAllNodes();
							setNodes(updated);
						}}
					/>
				)}
			</div>
		</div>
	);
}
