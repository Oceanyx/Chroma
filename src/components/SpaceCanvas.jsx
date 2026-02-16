// src/components/SpaceCanvas.jsx - V2 Complete with Fixed Shift+Drag
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
import RadialMenu from "./RadialMenu";
import { planetConfig, moonConfig } from "../seedData";
import Planet from "./Planet";
import Moon from "./Moon";
import ConnectionLine from "./ConnectionLine";
import ReflectionMode from "./ReflectionMode";
import NodeTypePicker from "./NodeTypePicker";
import NodeTextInput from "./NodeTextInput";
import TopNav from "./TopNav";
import { CANVAS } from "../utils/constants";

export default function SpaceCanvas({ purposeData }) {
	const [nodes, setNodes] = useState([]);
	const [edges, setEdges] = useState([]);
	const [selectedNodeId, setSelectedNodeId] = useState(null);
	const [hoveredNodeId, setHoveredNodeId] = useState(null);
	const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
	const [canvasRadialMenuMoon, setCanvasRadialMenuMoon] = useState(null);
	const [unlockedDimensions, setUnlockedDimensions] = useState([]);
	// Pan/Zoom state
	const [zoom, setZoom] = useState(CANVAS.defaultZoom);
	const [pan, setPan] = useState(CANVAS.defaultPan);
	const [isPanning, setIsPanning] = useState(false);
	const [panStart, setPanStart] = useState({ x: 0, y: 0 });
	const [tool, setTool] = useState("select");

	// Dragging state
	const [draggingNodeId, setDraggingNodeId] = useState(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

	// Node creation state
	const [showNodeTypePicker, setShowNodeTypePicker] = useState(false);
	const [nodeTypePickerPos, setNodeTypePickerPos] = useState({ x: 0, y: 0 });
	const [showNodeTextInput, setShowNodeTextInput] = useState(false);
	const [nodeTextInputType, setNodeTextInputType] = useState(null);
	const [nodeCreationPos, setNodeCreationPos] = useState({ x: 0, y: 0 }); // World position

	// Connection creation state
	const [creatingConnection, setCreatingConnection] = useState(false);
	const [connectionSource, setConnectionSource] = useState(null);
	const [connectionPreview, setConnectionPreview] = useState(null);

	// Reflection mode state
	const [reflectionMode, setReflectionMode] = useState({
		active: false,
		parentNodeId: null,
		previousView: { zoom: CANVAS.defaultZoom, pan: CANVAS.defaultPan },
	});

	// Animation state
	const [orbitTime, setOrbitTime] = useState(0);
	const animationFrameRef = useRef();
	const pausedTimeRef = useRef(null);

	const canvasRef = useRef(null);
	const containerRef = useRef(null);

	// ============================================================================
	// LOAD DATA
	// ============================================================================
	useEffect(() => {
		async function loadData() {
			await initializeDB();
			const loadedNodes = await getAllNodes();
			const loadedEdges = await getAllEdges();

			setNodes(loadedNodes);
			setEdges(loadedEdges);

			console.log(
				"📊 Loaded:",
				loadedNodes.length,
				"nodes,",
				loadedEdges.length,
				"edges",
			);
		}
		loadData();
	}, []);

	// Load unlocked dimensions
	useEffect(() => {
		async function loadUnlocked() {
			const unlocked = await getUnlockedDimensions();
			setUnlockedDimensions(unlocked);
		}
		loadUnlocked();
	}, [nodes]); // Reload when nodes change

	// ============================================================================
	// ORBIT ANIMATION
	// ============================================================================
	useEffect(() => {
		const animate = () => {
			if (!reflectionMode.active && !hoveredNodeId) {
				setOrbitTime((prev) => prev + 1);
			}
			animationFrameRef.current = requestAnimationFrame(animate);
		};

		animationFrameRef.current = requestAnimationFrame(animate);
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [reflectionMode.active, hoveredNodeId]);

	// ============================================================================
	// PAN/ZOOM CONTROLS
	// ============================================================================
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

	const handleCanvasMouseDown = (e) => {
		// Shift+drag for connection creation - don't interfere
		if (e.shiftKey && tool === "select") {
			return;
		}

		// Click empty canvas to create node
		if (
			tool === "select" &&
			(e.target === containerRef.current || e.target === canvasRef.current)
		) {
			// Show type picker at click position
			setNodeTypePickerPos({ x: e.clientX, y: e.clientY });

			// Calculate world position for node creation
			const canvasRect = canvasRef.current.getBoundingClientRect();
			const worldX =
				(e.clientX - canvasRect.left - pan.x) / zoom - planetConfig.baseRadius;
			const worldY =
				(e.clientY - canvasRect.top - pan.y) / zoom - planetConfig.baseRadius;
			setNodeCreationPos({ x: worldX, y: worldY });

			setShowNodeTypePicker(true);
			return;
		}

		// Pan with hand tool or empty canvas
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

	const handleCanvasMouseUp = async () => {
		setIsPanning(false);

		if (draggingNodeId) {
			const node = nodes.find((n) => n.id === draggingNodeId);
			if (node) {
				await db.nodes.update(node.id, { position: node.position });
			}
			setDraggingNodeId(null);
		}

		// Don't cancel connection here - it should complete when clicking target
		if (creatingConnection && !connectionPreview) {
			setCreatingConnection(false);
			setConnectionSource(null);
			setConnectionPreview(null);
		}
	};

	// Node creation handlers
	const handleNodeTypeSelect = (type) => {
		setNodeTextInputType(type);
		setShowNodeTypePicker(false);
		setShowNodeTextInput(true);
	};

	const handleNodeTextSave = async (text) => {
		const newNode = {
			type: nodeTextInputType,
			text: text,
			timestamp: Date.now(),
			state: nodeTextInputType === "O" ? "present" : "present",
			position: nodeCreationPos,
		};

		await db.nodes.add(newNode);
		const updated = await getAllNodes();
		setNodes(updated);

		// Clear state
		setShowNodeTextInput(false);
		setNodeTextInputType(null);
	};

	const handleNodeInputCancel = () => {
		setShowNodeTypePicker(false);
		setShowNodeTextInput(false);
		setNodeTextInputType(null);
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e) => {
			// Check if user is typing
			const isTyping =
				document.activeElement?.tagName === "INPUT" ||
				document.activeElement?.tagName === "TEXTAREA" ||
				document.activeElement?.isContentEditable;

			if (e.key === " " && !e.repeat && tool === "select" && !isTyping) {
				e.preventDefault();
				setTool("hand");
			}
			if (e.key === "Escape" && reflectionMode.active) {
				exitReflectionMode();
			}
			// NEW: Cancel connection creation
			if (e.key === "Escape" && creatingConnection) {
				setCreatingConnection(false);
				setConnectionSource(null);
				setConnectionPreview(null);
			}
			// NEW: Cancel node creation
			if (e.key === "Escape" && (showNodeTypePicker || showNodeTextInput)) {
				handleNodeInputCancel();
			}
		};

		const handleKeyUp = (e) => {
			const isTyping =
				document.activeElement?.tagName === "INPUT" ||
				document.activeElement?.tagName === "TEXTAREA" ||
				document.activeElement?.isContentEditable;

			if (e.key === " " && tool === "hand" && !isTyping) {
				setTool("select");
			}
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
	]);

	// ============================================================================
	// PLANET INTERACTIONS
	// ============================================================================
	const handlePlanetMouseDown = useCallback(
		(node, e) => {
			if (e.shiftKey && tool === "select") {
				e.stopPropagation();
				// START connection mode (don't create yet)
				setCreatingConnection(true);
				setConnectionSource(node);
				setConnectionPreview(null);
				return;
			}

			if (tool === "select") {
				e.stopPropagation();
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

			// Complete connection if creating one
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

			if (tool === "select" && !draggingNodeId) {
				setSelectedNodeId(node.id);
			}
		},
		[tool, creatingConnection, connectionSource, draggingNodeId],
	);

	const handlePlanetDoubleClick = useCallback((node, e) => {
		if (node.type === "O" || node.type === "A" || node.type === "I") {
			enterReflectionMode(node);
		}
	}, []);

	const handleMoonRightClick = useCallback((moon, e) => {
		e.preventDefault();
		e.stopPropagation();
		setCanvasRadialMenuMoon(moon);
	}, []);

	const handleCanvasRadialMenuAction = async (action, moon) => {
		switch (action) {
			case "edit":
				console.log("Edit moon:", moon.id);
				setCanvasRadialMenuMoon(null);
				break;

			case "versions":
				console.log("Show versions for:", moon.id);
				setCanvasRadialMenuMoon(null);
				break;

			case "toggleLock":
				await db.nodes.update(moon.id, { isLocked: !moon.isLocked });
				const updated = await getAllNodes();
				setNodes(updated);
				setCanvasRadialMenuMoon(null);
				break;

			case "tension":
			case "support":
				alert(
					"Create relationships in Reflection Mode (double-click the planet)",
				);
				setCanvasRadialMenuMoon(null);
				break;

			case "toggleWobble":
				const newConfidence =
					moon.confidence === "wobbly" ? "stable" : "wobbly";
				await db.nodes.update(moon.id, { confidence: newConfidence });
				const updated2 = await getAllNodes();
				setNodes(updated2);
				setCanvasRadialMenuMoon(null);
				break;

			case "delete":
				if (window.confirm(`Delete this ${moon.dimension} reflection?`)) {
					await db.nodes.delete(moon.id);
					const updated3 = await getAllNodes();
					setNodes(updated3);
				}
				setCanvasRadialMenuMoon(null);
				break;

			default:
				setCanvasRadialMenuMoon(null);
		}
	};

	const handlePlanetHover = useCallback(
		(node) => {
			setHoveredNodeId(node.id);
			// Capture current orbit time when starting to hover
			if (pausedTimeRef.current === null) {
				pausedTimeRef.current = orbitTime;
			}
		},
		[orbitTime],
	);

	const handlePlanetLeave = useCallback(() => {
		setHoveredNodeId(null);
		// Reset paused time when leaving
		pausedTimeRef.current = null;
	}, []);

	// ============================================================================
	// CONNECTION CREATION
	// ============================================================================
	const createConnection = async (source, target) => {
		if (target.timestamp <= source.timestamp) {
			alert("Target timestamp must be after source timestamp");
			return;
		}

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

	// ============================================================================
	// REFLECTION MODE
	// ============================================================================
	const enterReflectionMode = useCallback(
		(parentNode) => {
			const planetRadius = planetConfig.baseRadius;
			const targetZoom = 2.5;

			const viewportCenterX = window.innerWidth / 2;
			const viewportCenterY = (window.innerHeight - 60) / 2 + 60;

			const nodeCenterX = parentNode.position.x + planetRadius;
			const nodeCenterY = parentNode.position.y + planetRadius;

			const targetPanX = viewportCenterX - nodeCenterX * targetZoom;
			const targetPanY = viewportCenterY - nodeCenterY * targetZoom;

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

	// ============================================================================
	// RENDER MOONS WITH ORBIT ANIMATION
	// ============================================================================
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

			// Use paused time if hovering, otherwise use current time
			const effectiveTime =
				isHovered && pausedTimeRef.current !== null
					? pausedTimeRef.current
					: orbitTime;

			// Render orbital paths ONLY when hovering this specific planet
			if (isHovered && childMoons.length > 0) {
				const orbitalPaths = getOrbitalPaths(parent);
				orbitalPaths.forEach((path) => {
					moonElements.push(
						<circle
							key={`${parent.id}-path-${path.dimension}`}
							cx={path.centerX}
							cy={path.centerY}
							r={path.radius}
							fill="none"
							stroke={path.color}
							strokeWidth={2}
							strokeOpacity={0.6}
							strokeDasharray="5,5"
						/>,
					);
				});
			}

			// Render moons for each dimension
			Object.entries(grouped).forEach(([dimension, data]) => {
				if (data.count > 0) {
					// Show individual moons if count <= 3
					if (data.count <= 3) {
						const dimensionMoons = distributedMoons.filter(
							(m) => m.dimension === dimension,
						);
						dimensionMoons.forEach((moon) => {
							const animatedPosition = calculateAnimatedOrbit(
								moon,
								parent,
								effectiveTime,
								false,
								dimension,
							);

							moonElements.push(
								<Moon
									key={moon.id}
									node={moon}
									position={animatedPosition}
									count={1}
									isHovered={hoveredNodeId === moon.id}
									isSelected={selectedNodeId === moon.id}
									onClick={handlePlanetClick}
									onContextMenu={handleMoonRightClick}
									onMouseEnter={handlePlanetHover}
									onMouseLeave={handlePlanetLeave}
								/>,
							);
						});
					} else {
						// Show aggregate moon when count > 3
						const firstMoon = data.moons[0];
						const distributedMoon = distributedMoons.find(
							(m) => m.id === firstMoon.id,
						);

						const animatedPosition = distributedMoon
							? calculateAnimatedOrbit(
									distributedMoon,
									parent,
									effectiveTime,
									false,
									dimension,
								)
							: data.position;

						const aggregateNode = {
							id: `${parent.id}-${dimension}`,
							type: "R",
							dimension,
							text: `${data.count} ${dimension} reflection${data.count > 1 ? "s" : ""}`,
							position: animatedPosition,
							parentId: parent.id,
						};

						moonElements.push(
							<Moon
								key={aggregateNode.id}
								node={aggregateNode}
								position={animatedPosition}
								count={data.count}
								isHovered={hoveredNodeId === aggregateNode.id}
								isSelected={selectedNodeId === aggregateNode.id}
								onClick={handlePlanetClick}
								onContextMenu={handleMoonRightClick}
								onMouseEnter={handlePlanetHover}
								onMouseLeave={handlePlanetLeave}
							/>,
						);
					}
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

	// ============================================================================
	// RENDER
	// ============================================================================
	const parentNodes = nodes.filter(
		(n) => n.type === "O" || n.type === "A" || n.type === "I",
	);
	const focusedParent = reflectionMode.active
		? nodes.find((n) => n.id === reflectionMode.parentNodeId)
		: null;

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
			<TopNav purposeData={purposeData} tool={tool} onToolChange={setTool} />

			<div
				ref={containerRef}
				onMouseDown={handleCanvasMouseDown}
				onMouseMove={handleCanvasMouseMove}
				onMouseUp={handleCanvasMouseUp}
				onMouseLeave={handleCanvasMouseUp}
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

							{creatingConnection && connectionSource && connectionPreview && (
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
				{/* Node Creation UI */}
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
			{/* Canvas RadialMenu - right-click on moons */}
			{canvasRadialMenuMoon && (
				<div
					onClick={() => setCanvasRadialMenuMoon(null)}
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 1000,
					}}>
					<svg width="100%" height="100%" style={{ pointerEvents: "auto" }}>
						<g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
							<RadialMenu
								moon={canvasRadialMenuMoon}
								moonPosition={(() => {
									// Calculate the moon's current animated position
									const parent = nodes.find(
										(n) => n.id === canvasRadialMenuMoon.parentId,
									);
									if (!parent) return { x: 400, y: 400 };

									const childMoons = nodes.filter(
										(n) => n.parentId === parent.id,
									);
									const distributed = distributeMoonsEvenly(childMoons, parent);
									const moonData = distributed.find(
										(m) => m.id === canvasRadialMenuMoon.id,
									);

									if (!moonData) return { x: 400, y: 400 };

									return calculateAnimatedOrbit(
										moonData,
										parent,
										orbitTime,
										false,
										canvasRadialMenuMoon.dimension,
									);
								})()}
								onAction={(action) =>
									handleCanvasRadialMenuAction(action, canvasRadialMenuMoon)
								}
								onClose={() => setCanvasRadialMenuMoon(null)}
								dimensionColor={
									moonConfig.dimension[canvasRadialMenuMoon.dimension].color
								}
							/>
						</g>
					</svg>
				</div>
			)}
		</div>
	);
}
