// src/components/PerceptionCanvas.jsx
import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Hand, MousePointer } from "lucide-react";

import ObservationNode from "./nodes/ObservationNode";
import ActionNode from "./nodes/ActionNode";
import ReflectionNode from "./nodes/ReflectionNode";

import {
  initializeDB,
  getAllNodes,
  getAllEdges,
  addNode as dbAddNode,
  addEdge as dbAddEdge,
  deleteNode as dbDeleteNode,
  createObservation,
} from "../lib/db-v2";

const nodeTypes = {
  O: ObservationNode,
  A: ActionNode,
  R: ReflectionNode,
};

export default function PerceptionCanvas({ purposeData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [tool, setTool] = useState("select"); // 'select' or 'hand'
  const [isPanning, setIsPanning] = useState(false);

  // Initialize DB and load data
  useEffect(() => {
    async function loadData() {
      await initializeDB();
      const dbNodes = await getAllNodes();
      const dbEdges = await getAllEdges();

      // Convert DB nodes to React Flow format
      const flowNodes = dbNodes.map((node) => ({
        id: String(node.id),
        type: node.type,
        position: { x: node.x || 0, y: node.y || 0 },
        data: node,
      }));

      const flowEdges = dbEdges.map((edge) => ({
        id: String(edge.id),
        source: String(edge.sourceId),
        target: String(edge.targetId),
        type: "smoothstep",
        animated: true,
        style: { stroke: "#6C63FF", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6C63FF",
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
    loadData();
  }, []);

  // Handle node selection (for double-tap zoom later)
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Handle edge creation
  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#6C63FF", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#6C63FF",
      },
    };
    // Keyboard shortcuts for tools
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "v" || e.key === "V") {
          setTool("select");
        }
        if (e.key === "h" || e.key === "H") {
          setTool("hand");
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    setEdges((eds) => addEdge(newEdge, eds));

    // Save to DB
    dbAddEdge({
      sourceId: parseInt(params.source),
      targetId: parseInt(params.target),
    }).catch((err) => {
      console.error("Edge creation failed:", err.message);
      alert(err.message);
    });
  }, []);

  // Create new Observation (for testing)
  const handleCreateObservation = async () => {
    if (!reactFlowInstance) return;

    const viewport = reactFlowInstance.getViewport();
    const centerX = (-viewport.x + window.innerWidth / 2) / viewport.zoom;
    const centerY = (-viewport.y + window.innerHeight / 2) / viewport.zoom;

    const newNode = createObservation("New observation", centerX, centerY);

    const id = await dbAddNode(newNode);

    setNodes((nds) => [
      ...nds,
      {
        id: String(id),
        type: "O",
        position: { x: centerX, y: centerY },
        data: { ...newNode, id },
      },
    ]);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "linear-gradient(180deg, #0A0F1E 0%, #0F1428 100%)",
      }}
    >
      {/* Tool Selector - Bottom Left */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 100,
        }}
      >
        <button
          onClick={() => setTool("select")}
          style={{
            padding: "10px",
            background: tool === "select" ? "#6C63FF" : "#1E293B",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#E6EEF8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          title="Select Tool (V)"
        >
          <MousePointer size={20} />
        </button>
        <button
          onClick={() => setTool("hand")}
          style={{
            padding: "10px",
            background: tool === "hand" ? "#6C63FF" : "#1E293B",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#E6EEF8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          title="Hand Tool (H)"
        >
          <Hand size={20} />
        </button>
      </div>

      {/* Test Button - Bottom Right */}
      <button
        onClick={handleCreateObservation}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          padding: "12px 20px",
          background: "#6C63FF",
          border: "none",
          borderRadius: "8px",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        + Observation
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        panOnDrag={tool === "hand"}
        nodesDraggable={tool === "select"}
        elementsSelectable={tool === "select"}
      >
        <Background
          color="#1E293B"
          gap={20}
          size={1}
          style={{ opacity: 0.3 }}
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "O") return "#fff";
            if (node.type === "A") return "#10B981";
            if (node.type === "R") return "#A78BFA";
            return "#fff";
          }}
        />
      </ReactFlow>
    </div>
  );
}
