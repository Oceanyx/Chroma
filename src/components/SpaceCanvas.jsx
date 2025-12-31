// src/components/SpaceCanvas.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  db,
  initializeDB,
  getAllNodes,
  getAllEdges,
  cascadeDeleteNode,
  getMoonsGroupedByDomain,
} from "../lib/db";
import { groupMoonsByDomain } from "../lib/orbitalPhysics";
import Planet from "./Planet";
import Moon from "./Moon";
import ConnectionLine from "./ConnectionLine";
import PatternZone from "./PatternZone";
import ReflectionMode from "./ReflectionMode";
import TopNav from "./TopNav";
import MainDock from "./MainDock";
import { CANVAS, PLANET } from "../utils/constants";

export default function SpaceCanvas({ purposeData }) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  // Pan/Zoom state
  const [zoom, setZoom] = useState(CANVAS.defaultZoom);
  const [pan, setPan] = useState(CANVAS.defaultPan);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState("select"); // 'select' or 'hand'

  // Reflection mode state
  const [reflectionMode, setReflectionMode] = useState({
    active: false,
    parentNodeId: null,
    previousView: { zoom: CANVAS.defaultZoom, pan: CANVAS.defaultPan },
  });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // ============================================================================
  // LOAD DATA FROM DATABASE
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

  // ============================================================================
  // PAN/ZOOM CONTROLS
  // ============================================================================

  // Mouse wheel zoom
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

  // Pan controls
  const handleCanvasMouseDown = (e) => {
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
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space key for hand tool
      if (e.key === " " && !e.repeat && tool === "select") {
        e.preventDefault();
        setTool("hand");
      }
      // Escape to exit reflection mode
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
  // NODE INTERACTION HANDLERS
  // ============================================================================

  const handleNodeClick = useCallback(
    (node, e) => {
      e.stopPropagation();
      if (tool === "select") {
        setSelectedNodeId(node.id);
      }
    },
    [tool]
  );

  const handleNodeDoubleClick = useCallback((node, e) => {
    e.stopPropagation();

    // Only parent nodes (O/A) can be double-clicked to enter reflection mode
    if (node.type === "O" || node.type === "A") {
      enterReflectionMode(node);
    }
  }, []);

  const handleNodeHover = useCallback((node) => {
    setHoveredNodeId(node.id);
  }, []);

  const handleNodeLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  // ============================================================================
  // REFLECTION MODE
  // ============================================================================

  const enterReflectionMode = useCallback(
    (parentNode) => {
      // Calculate zoom and pan to center the parent node
      const planetRadius = PLANET[parentNode.type].radius;
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

      // Animate to target view
      setZoom(targetZoom);
      setPan({ x: targetPanX, y: targetPanY });
    },
    [zoom, pan]
  );

  const exitReflectionMode = useCallback(() => {
    // Restore previous view
    setZoom(reflectionMode.previousView.zoom);
    setPan(reflectionMode.previousView.pan);

    setReflectionMode({
      active: false,
      parentNodeId: null,
      previousView: { zoom: CANVAS.defaultZoom, pan: CANVAS.defaultPan },
    });
  }, [reflectionMode]);

  // ============================================================================
  // CANVAS CLICK (DESELECT)
  // ============================================================================

  const handleCanvasClick = useCallback(
    (e) => {
      if (e.target === containerRef.current || e.target === canvasRef.current) {
        setSelectedNodeId(null);

        // Exit reflection mode if clicking outside
        if (reflectionMode.active) {
          exitReflectionMode();
        }
      }
    },
    [reflectionMode.active, exitReflectionMode]
  );

  // ============================================================================
  // DELETE NODE WITH CASCADE CONFIRMATION
  // ============================================================================

  const handleDeleteNode = useCallback(
    async (nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      if (node.type === "O" || node.type === "A") {
        // Check for child moons
        const childMoons = nodes.filter((n) => n.parentId === nodeId);

        if (childMoons.length > 0) {
          const confirmed = window.confirm(
            `This will delete ${
              childMoons.length
            } reflection moon(s) attached to this ${
              node.type === "O" ? "observation" : "action"
            }. Continue?`
          );

          if (!confirmed) return;
        }

        await cascadeDeleteNode(nodeId);
      } else {
        await db.nodes.delete(nodeId);
      }

      // Reload data
      const updatedNodes = await getAllNodes();
      const updatedEdges = await getAllEdges();
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setSelectedNodeId(null);
    },
    [nodes]
  );

  // ============================================================================
  // RENDER GROUPED MOONS
  // ============================================================================

  const renderMoons = useCallback(() => {
    const parentNodes = nodes.filter((n) => n.type === "O" || n.type === "A");
    const moonElements = [];

    parentNodes.forEach((parent) => {
      const childMoons = nodes.filter((n) => n.parentId === parent.id);
      const grouped = groupMoonsByDomain(childMoons, parent);

      // Render aggregate moons for each domain
      Object.entries(grouped).forEach(([domain, data]) => {
        if (data.count > 0) {
          // Create a representative node for the aggregate
          const aggregateNode = {
            id: `${parent.id}-${domain}`,
            type: "R",
            domain,
            text: `${data.count} ${domain} reflection${
              data.count > 1 ? "s" : ""
            }`,
            position: data.position,
            parentId: parent.id,
          };

          moonElements.push(
            <Moon
              key={aggregateNode.id}
              node={aggregateNode}
              position={data.position}
              count={data.count}
              isHovered={hoveredNodeId === aggregateNode.id}
              isSelected={selectedNodeId === aggregateNode.id}
              onClick={handleNodeClick}
              onMouseEnter={handleNodeHover}
              onMouseLeave={handleNodeLeave}
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
    handleNodeClick,
    handleNodeHover,
    handleNodeLeave,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const parentNodes = nodes.filter((n) => n.type === "O" || n.type === "A");
  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null;

  // In reflection mode, determine which nodes to show
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
      {/* Top Navigation */}
      <TopNav purposeData={purposeData} tool={tool} onToolChange={setTool} />

      {/* Main Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onClick={handleCanvasClick}
        style={{
          flex: 1,
          position: "relative",
          cursor:
            tool === "hand" ? (isPanning ? "grabbing" : "grab") : "default",
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
              {/* Pattern Zones (lowest layer) */}
              {patterns.map((pattern) => (
                <PatternZone
                  key={pattern.id}
                  pattern={pattern}
                  nodes={nodes}
                  isHovered={false}
                />
              ))}

              {/* Connection Lines */}
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

              {/* Parent Planets (O/A nodes) */}
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
                  onClick={handleNodeClick}
                  onDoubleClick={handleNodeDoubleClick}
                  onMouseEnter={handleNodeHover}
                  onMouseLeave={handleNodeLeave}
                />
              ))}

              {/* Moons (R nodes) - Aggregated by domain */}
              {!reflectionMode.active && renderMoons()}
            </g>
          </svg>
        </div>

        {/* Reflection Mode Overlay */}
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

      {/* Main Dock (Bottom) */}
      {!reflectionMode.active && (
        <MainDock
          onCreateObservation={async () => {
            const newNode = {
              type: "O",
              text: "New observation",
              timestamp: Date.now(),
              position: {
                x: (window.innerWidth / 2 - pan.x) / zoom - 50,
                y: (window.innerHeight / 2 - pan.y - 60) / zoom - 50,
              },
            };
            const id = await db.nodes.add(newNode);
            const updated = await getAllNodes();
            setNodes(updated);
          }}
          onCreateAction={async () => {
            const newNode = {
              type: "A",
              text: "New action",
              timestamp: Date.now(),
              state: "present",
              position: {
                x: (window.innerWidth / 2 - pan.x) / zoom - 50,
                y: (window.innerHeight / 2 - pan.y - 60) / zoom - 50,
              },
            };
            const id = await db.nodes.add(newNode);
            const updated = await getAllNodes();
            setNodes(updated);
          }}
        />
      )}
    </div>
  );
}
