// src/components/SpaceCanvas.jsx - Fully Integrated with New Planet/Moon System
import React, { useState, useEffect, useRef, useCallback } from "react";
import { db, initializeDB, getAllNodes, getAllEdges } from "../lib/db";
import {
  groupMoonsByDomain,
  distributeMoonsEvenly,
  calculateAnimatedOrbit,
} from "../lib/orbitalPhysics";
import { getRandomVariant, planetConfig } from "../seedData";
import Planet from "./Planet";
import Moon from "./Moon";
import ConnectionLine from "./ConnectionLine";
import ReflectionMode from "./ReflectionMode";
import TopNav from "./TopNav";
import MainDock from "./MainDock";
import { CANVAS } from "../utils/constants";

export default function SpaceCanvas({ purposeData }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  // Pan/Zoom state
  const [zoom, setZoom] = useState(CANVAS.defaultZoom);
  const [pan, setPan] = useState(CANVAS.defaultPan);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState("select");

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
        "edges"
      );
    }
    loadData();
  }, []);

  // Migrate nodes to add variants if missing
  useEffect(() => {
    async function migrateNodes() {
      const nodesToUpdate = nodes.filter(
        (n) => (n.type === "O" || n.type === "A") && !n.variant
      );

      if (nodesToUpdate.length > 0) {
        console.log(
          "🔄 Migrating",
          nodesToUpdate.length,
          "nodes to add variants..."
        );
        for (const node of nodesToUpdate) {
          const variant = getRandomVariant(node.type);
          await db.nodes.update(node.id, { variant });
        }
        const updated = await getAllNodes();
        setNodes(updated);
        console.log("✅ Migration complete!");
      }
    }

    if (nodes.length > 0) {
      migrateNodes();
    }
  }, [nodes.length]);

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
          Math.min(Math.max(CANVAS.minZoom, prev + delta), CANVAS.maxZoom)
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
    if (e.shiftKey && tool === "select") {
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
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = (e.clientX - canvasRect.left - dragOffset.x - pan.x) / zoom;
      const newY = (e.clientY - canvasRect.top - dragOffset.y - pan.y) / zoom;

      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === draggingNodeId ? { ...n, position: { x: newX, y: newY } } : n
        )
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

    if (creatingConnection) {
      setCreatingConnection(false);
      setConnectionSource(null);
      setConnectionPreview(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === " " && !e.repeat && tool === "select") {
        e.preventDefault();
        setTool("hand");
      }
      if (e.key === "Escape" && reflectionMode.active) {
        exitReflectionMode();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === " " && tool === "hand") {
        setTool("select");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [tool, reflectionMode.active]);

  // ============================================================================
  // PLANET INTERACTIONS
  // ============================================================================
  const handlePlanetMouseDown = useCallback(
    (node, e) => {
      if (e.shiftKey) {
        e.stopPropagation();
        setCreatingConnection(true);
        setConnectionSource(node);
      } else if (tool === "select") {
        e.stopPropagation();
        setDraggingNodeId(node.id);
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    },
    [tool]
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

      if (tool === "select" && !draggingNodeId) {
        setSelectedNodeId(node.id);
      }
    },
    [tool, creatingConnection, connectionSource, draggingNodeId]
  );

  const handlePlanetDoubleClick = useCallback((node, e) => {
    e.stopPropagation();
    if (node.type === "O" || node.type === "A") {
      enterReflectionMode(node);
    }
  }, []);

  const handlePlanetHover = useCallback((node) => {
    setHoveredNodeId(node.id);
  }, []);

  const handlePlanetLeave = useCallback(() => {
    setHoveredNodeId(null);
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
    [zoom, pan]
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
  // NODE CREATION
  // ============================================================================
  const handleCreateObservation = async () => {
    const centerX =
      (window.innerWidth / 2 - pan.x) / zoom - planetConfig.baseRadius;
    const centerY =
      (window.innerHeight / 2 - pan.y - 60) / zoom - planetConfig.baseRadius;

    const newNode = {
      type: "O",
      text: "New observation",
      timestamp: Date.now(),
      state: "present",
      variant: getRandomVariant("O"),
      position: { x: centerX, y: centerY },
    };

    await db.nodes.add(newNode);
    const updated = await getAllNodes();
    setNodes(updated);
  };

  const handleCreateAction = async () => {
    const centerX =
      (window.innerWidth / 2 - pan.x) / zoom - planetConfig.baseRadius;
    const centerY =
      (window.innerHeight / 2 - pan.y - 60) / zoom - planetConfig.baseRadius;

    const newNode = {
      type: "A",
      text: "New action",
      timestamp: Date.now(),
      state: "present",
      variant: getRandomVariant("A"),
      position: { x: centerX, y: centerY },
    };

    await db.nodes.add(newNode);
    const updated = await getAllNodes();
    setNodes(updated);
  };

  // ============================================================================
  // RENDER MOONS WITH ORBIT ANIMATION
  // ============================================================================
  const renderMoons = useCallback(() => {
    const parentNodes = nodes.filter((n) => n.type === "O" || n.type === "A");
    const moonElements = [];

    parentNodes.forEach((parent) => {
      const childMoons = nodes.filter((n) => n.parentId === parent.id);
      const distributedMoons = distributeMoonsEvenly(childMoons, parent);
      const grouped = groupMoonsByDomain(childMoons, parent);
      const isPaused = hoveredNodeId === parent.id;

      Object.entries(grouped).forEach(([domain, data]) => {
        if (data.count > 0) {
          const firstMoon = data.moons[0];
          const distributedMoon = distributedMoons.find(
            (m) => m.id === firstMoon.id
          );

          const animatedPosition = distributedMoon
            ? calculateAnimatedOrbit(
                distributedMoon,
                parent,
                orbitTime,
                isPaused,
                domain
              )
            : data.position;

          const aggregateNode = {
            id: `${parent.id}-${domain}`,
            type: "R",
            domain,
            text: `${data.count} ${domain} reflection${
              data.count > 1 ? "s" : ""
            }`,
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
              onMouseEnter={handlePlanetHover}
              onMouseLeave={handlePlanetLeave}
            />
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

  // ============================================================================
  // RENDER
  // ============================================================================
  const parentNodes = nodes.filter((n) => n.type === "O" || n.type === "A");
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
      }}
    >
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
        }}
      >
        <div
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            backgroundImage: `radial-gradient(circle, rgba(30, 41, 59, ${CANVAS.gridOpacity}) 1px, transparent 1px)`,
            backgroundSize: `${CANVAS.gridSize * zoom}px ${
              CANVAS.gridSize * zoom
            }px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <g
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
              style={{ pointerEvents: "auto" }}
            >
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
      </div>

      {!reflectionMode.active && (
        <MainDock
          onCreateObservation={handleCreateObservation}
          onCreateAction={handleCreateAction}
        />
      )}
    </div>
  );
}
