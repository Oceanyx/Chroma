// src/components/CanvasView.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Filter, BarChart3, Edit2, ZoomIn, ZoomOut, Maximize2, Hand, MousePointer, Github, Linkedin, Mail, Coffee } from 'lucide-react';
import NodeDetailPanel from './NodeDetailPanel';
import Node from './Node';
import AnalyticsPanel from './AnalyticsPanel';
import LensManager from './LensManager';
import LeftSidebar from './LeftSidebar';
import PurposeModal from './PurposeModal';
import LegendModal from './LegendModal';
import PreferencesModal from './PreferencesModal';
import { domainColors, defaultLenses, modes, predefinedMetaTags, connectionTypes} from '../seedData';
import { 
  db, 
  initializeDB, 
  getAllNodes, 
  getAllEdges, 
  getAllLenses,
  addNode,
  updateNode as dbUpdateNode,
  deleteNode as dbDeleteNode,
  addEdge,
  updateEdge,
  deleteEdge as dbDeleteEdge,
  updateLenses as dbUpdateLenses
} from '../lib/db';

export default function CanvasView({purposeData}) {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoing, setIsUndoRedoing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [mapTitle, setMapTitle] = useState(purposeData?.title || 'Untitled Map');
  const [focusedDomain, setFocusedDomain] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [lenses, setLenses] = useState(defaultLenses);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showLensDropdown, setShowLensDropdown] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeLensIds, setActiveLensIds] = useState([]);
  const [activeFilters, setActiveFilters] = useState({ domains: [], lenses: [] });
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLensManager, setShowLensManager] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 400, y: 200 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('select'); // 'select' or 'hand'
  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('chroma-theme');
    return saved || 'dark';
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const [nodeDetailMode, setNodeDetailMode] = useState(() => {
    return localStorage.getItem('chroma-node-detail-mode') || 'sidebar';
  });
  const [showNodeModal, setShowNodeModal] = useState(false);
  // Save theme preference when it changes
  useEffect(() => {
    localStorage.setItem('chroma-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  // Shared recent meta-tags (persisted to localStorage)
  const [recentMetaTags, setRecentMetaTags] = useState(() => {
    try {
      const raw = localStorage.getItem('recentMetaTags');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    // a small default slice to help first-time users
    return predefinedMetaTags.slice(0, 6);
  });

  const addRecentMetaTag = useCallback((tag) => {
    setRecentMetaTags(prev => {
      const next = [tag, ...prev.filter(t => t !== tag)].slice(0, 30);
      try { localStorage.setItem('recentMetaTags', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }, []);

  // Initialize database and load data
  useEffect(() => {
  async function loadData() {
    await initializeDB();
    const loadedNodes = await getAllNodes();
    const loadedEdges = await getAllEdges();
    const loadedLenses = await getAllLenses();
    
    /*console.log('Loaded nodes:', loadedNodes);
    console.log('Loaded edges:', loadedEdges);
    console.log('Loaded lenses:', loadedLenses);
    */
    
    setNodes(loadedNodes);
    setEdges(loadedEdges);
    if (loadedLenses.length > 0) {
      setLenses(loadedLenses);
    }
  }
  loadData();
}, []);
const saveToHistory = useCallback((newNodes, newEdges) => {
  if (isUndoRedoing) return;
  
  const snapshot = {
    nodes: JSON.parse(JSON.stringify(newNodes)),
    edges: JSON.parse(JSON.stringify(newEdges)),
    timestamp: Date.now()
  };
  
  setHistoryIndex(currentIndex => {
    setHistory(currentHistory => {
      const newHistory = currentHistory.slice(0, currentIndex + 1);
      newHistory.push(snapshot);
      return newHistory.slice(-50);
    });
    return currentIndex + 1;
  });
}, [isUndoRedoing]);

  const handleUndo = useCallback(async () => {
  setHistoryIndex(currentIndex => {
    if (currentIndex <= 0) return currentIndex;
    
    setIsUndoRedoing(true);
    
    setHistory(currentHistory => {
      const prevState = currentHistory[currentIndex - 1];
      
      // Update database and UI
      (async () => {
        await db.nodes.clear();
        await db.edges.clear();
        await db.nodes.bulkAdd(prevState.nodes);
        await db.edges.bulkAdd(prevState.edges);
        
        setNodes(prevState.nodes);
        setEdges(prevState.edges);
        
        setTimeout(() => setIsUndoRedoing(false), 100);
      })();
      
      return currentHistory;
    });
    
    return currentIndex - 1;
  });
}, []);

const handleRedo = useCallback(async () => {
  // Check if redo is available first
  if (historyIndex >= history.length - 1) {
    console.log('No redo available', historyIndex, history.length);
    return;
  }
  
  setIsUndoRedoing(true);
  const nextState = history[historyIndex + 1];
  console.log('Redoing to state:', historyIndex + 1);
  
  // Update database
  await db.nodes.clear();
  await db.edges.clear();
  await db.nodes.bulkAdd(nextState.nodes);
  await db.edges.bulkAdd(nextState.edges);
  
  // Update UI state
  setNodes(nextState.nodes);
  setEdges(nextState.edges);
  setHistoryIndex(historyIndex + 1);
  
  setTimeout(() => setIsUndoRedoing(false), 100);
}, [history, historyIndex]);

useEffect(() => {
  const handleKeyboard = (e) => {
    // Check for Ctrl+Z (undo)
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      // console.log('Undo triggered');
      handleUndo();
    } 
    // Check for Ctrl+Shift+Z or Ctrl+Y (redo)
    else if ((e.metaKey || e.ctrlKey) && (
      (e.shiftKey && e.key.toLowerCase() === 'z') || 
      e.key.toLowerCase() === 'y'
    )) {
      e.preventDefault();
      // console.log('Redo triggered');
      handleRedo();
    }
  };
  
  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, [handleUndo, handleRedo]);

  // Close preferences with ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showPreferences) {
        setShowPreferences(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showPreferences]);
  
  // Save initial state to history
  useEffect(() => {
    if (nodes.length > 0 && history.length === 0) {
      saveToHistory(nodes, edges);
    }
  }, [nodes, edges, history.length, saveToHistory]);
  // Keyboard shortcut for hand tool
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' && !e.repeat && tool === 'select') {
        e.preventDefault();
        setTool('hand');
      }
      if (e.key === 'v' || e.key === 'V') {
        setTool('select');
      }
      if (e.key === 'h' || e.key === 'H') {
        setTool('hand');
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === ' ' && tool === 'hand') {
        setTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [tool]);

  // Zoom with mouse wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.min(Math.max(0.3, prev + delta), 3));
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const blendColors = useCallback((domainIds) => {
    if (!domainIds || domainIds.length === 0) return '#1E293B';
    if (domainIds.length === 1) {
      const color = domainColors[domainIds[0]];
      return `linear-gradient(180deg, ${color}25, ${color}15)`;
    }
    if (domainIds.length === 2) {
      const c1 = domainColors[domainIds[0]];
      const c2 = domainColors[domainIds[1]];
      return `linear-gradient(135deg, ${c1}25 0%, ${c2}25 100%)`;
    }
    const c1 = domainColors[domainIds[0]];
    const c2 = domainColors[domainIds[1]];
    const c3 = domainColors[domainIds[2]];
    return `linear-gradient(135deg, ${c1}20 0%, ${c2}20 50%, ${c3}20 100%)`;
  }, []);

  const getDomainBounds = useCallback((domainNode) => {
    const radius = domainNode.width / 2;
    const centerX = domainNode.position.x + radius;
    const centerY = domainNode.position.y + radius;
    
    return {
      centerX,
      centerY,
      radius,
      left: domainNode.position.x,
      top: domainNode.position.y,
      right: domainNode.position.x + domainNode.width,
      bottom: domainNode.position.y + domainNode.width
    };
  }, []);

  const getDomainsAtPosition = useCallback((pos) => {
    const domainNodes = nodes.filter(n => n.type === 'domain');
    const hits = [];
    for (const d of domainNodes) {
      const bounds = getDomainBounds(d);
      const dx = pos.x - bounds.centerX;
      const dy = pos.y - bounds.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= bounds.radius) {
        hits.push(d.data.domainId);
      }
    }
    return hits;
  }, [nodes, getDomainBounds]);

  const handleDragStart = (e, node) => {
    if (node.type === 'content' && tool === 'select') {
      e.stopPropagation();
      setDraggingNode(node.id);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleDragEnd = async (e, node) => {
  if (node.type === 'content' && canvasRef.current) {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = (e.clientX - canvasRect.left - dragOffset.x - pan.x) / zoom;
    const newY = (e.clientY - canvasRect.top - dragOffset.y - pan.y) / zoom;
    
    const newPos = { x: newX, y: newY };
    const domainIds = getDomainsAtPosition(newPos);

    await dbUpdateNode(node.id, { position: newPos, data: { ...node.data, domainIds } });
    
    const updatedNodes = nodes.map(n => 
      n.id === node.id
        ? { ...n, position: newPos, data: { ...n.data, domainIds } }
        : n
    );
    
    setNodes(updatedNodes);
    saveToHistory(updatedNodes, edges);
  }
  setDraggingNode(null);
};

  const handleNodeClick = (node, e) => {
  e.stopPropagation();
  if (node.type === 'content' && tool === 'select') {
    setSelectedNodeId(node.id);
    // If preference is set to modal, open in modal mode
    if (nodeDetailMode === 'modal') {
      setShowNodeModal(true);
    }
  }
};

  const handleNodeHover = (node) => {
    if (node.type === 'content') {
      setHoveredNode(node.id);
    }
  };

  const handleNodeLeave = () => {
    setHoveredNode(null);
  };

const handleUpdateNode = useCallback(async (nodeId, newData) => {
  await dbUpdateNode(nodeId, { data: newData });
  
  setNodes(currentNodes => {
    const updatedNodes = currentNodes.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    );
    
    // Save to history after state update
    setTimeout(() => {
      saveToHistory(updatedNodes, edges);
    }, 0);
    
    return updatedNodes;
  });
}, [edges, saveToHistory]);

  const handleDeleteNode = useCallback(async (nodeId) => {
    await dbDeleteNode(nodeId);
    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    const updatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    saveToHistory(updatedNodes, updatedEdges);
  }, [nodes, edges, saveToHistory]);

  const handleCreateEdge = useCallback(async (newEdge) => {
    await addEdge(newEdge);
    setEdges(current => [...current, newEdge]);
  }, []);

  const handleDeleteEdge = useCallback(async (edgeId) => {
    await dbDeleteEdge(edgeId);
    setEdges(current => current.filter(e => e.id !== edgeId));
  }, []);

const handleUpdateEdge = useCallback(async (edgeId, updates) => {
    // If updating type, clear the label so it uses the connection type name
    if (updates.type) {
      const connType = connectionTypes.find(c => c.id === updates.type);
      updates.label = connType?.name || updates.label;
    }
    await updateEdge(edgeId, updates);
    const updatedEdges = edges.map(e => e.id === edgeId ? { ...e, ...updates } : e);
    setEdges(updatedEdges);
    saveToHistory(nodes, updatedEdges);
  }, []);
  
  const handleUpdateLenses = useCallback(async (newLenses) => {
    await dbUpdateLenses(newLenses);
    setLenses(newLenses);
  }, []);

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.nodes || !data.edges) {
          alert('Invalid map file format');
          return;
        }
        
        if (!window.confirm('This will replace your current map. Continue?')) {
          return;
        }
        
        // Clear existing data
        await db.nodes.clear();
        await db.edges.clear();
        
        // Import new data
        await db.nodes.bulkAdd(data.nodes);
        await db.edges.bulkAdd(data.edges);
        
        if (data.lenses) {
          await db.lenses.clear();
          await db.lenses.bulkAdd(data.lenses);
          setLenses(data.lenses);
        }
        
        // Reload
        const loadedNodes = await getAllNodes();
        const loadedEdges = await getAllEdges();
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        
        alert('Map imported successfully!');
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import map. Please check the file format.');
      }
    };
    input.click();
  };

  const handleExportJSON = () => {
    const data = {
      nodes,
      edges,
      lenses,
      purposeData: { ...purposeData, title: mapTitle },
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perception-map-${mapTitle.replace(/\s+/g, '-').toLowerCase() || 'untitled'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async () => {
    // Load html2canvas dynamically
    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(script);
      await new Promise(resolve => script.onload = resolve);
    }

    // Temporarily hide UI elements
    setSelectedNodeId(null); // Close detail panel
    setShowAnalytics(false);
    setShowLensManager(false);
    setShowFilters(false);
    
    // Wait a moment for React to re-render
    await new Promise(resolve => setTimeout(resolve, 100));

    const container = containerRef.current;
    if (!container) return;

    try {
      const canvas = await window.html2canvas(container, {
        backgroundColor: '#0F1724',
        scale: 2,
        logging: false
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chroma-${mapTitle.replace(/\s+/g, '-').toLowerCase() || 'untitled'}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PNG. Please try again.');
    }
  };

  const handleCreateNode = async () => {
    const centerX = (window.innerWidth / 2 - pan.x) / zoom;
    const centerY = (window.innerHeight / 2 - pan.y - 60) / zoom;
    
    const newNode = {
      type: 'content',
      position: { x: centerX, y: centerY },
      data: {
        title: 'New Node',
        perceivedPattern: '',
        interpretation: '',
        activeQuestions: '',
        feltSense: '',
        agencyOrientation: 'curious',
        metaTags: [],
        patternType: 'trigger',
        beforeState: '',
        afterState: '',
        refinesNodeId: null,
        lensIds: [lenses[0]?.id || 'empathy'],
        domainIds: [],
        mode: 'field-first',
        notes: '',
        createdAt: new Date().toISOString()
      }
    };
    
    const id = await addNode(newNode);
    const nodeWithId = { ...newNode, id };
    const updatedNodes = [...nodes, nodeWithId];
    setNodes(updatedNodes);
    setSelectedNode(nodeWithId);
    saveToHistory(updatedNodes, edges);
  };
  

  const getNodeCenter = (node) => {
    const width = node.type === 'content' ? 210 : 100;
    const height = node.type === 'content' ? 80 : 40;
    return {
      x: node.position.x + width / 2,
      y: node.position.y + height / 2
    };
  };

  const toggleFilter = (type, value) => {
    setActiveFilters(prev => {
      const current = prev[type];
      return {
        ...prev,
        [type]: current.includes(value) 
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  const filteredNodes = nodes.filter(node => {
    if (node.type !== 'content') return true;
    
    if (viewMode !== 'all' && !node.data.domainIds?.includes(viewMode)) {
      return false;
    }

    if (activeFilters.domains.length > 0) {
      const hasMatchingDomain = activeFilters.domains.some(d => 
        node.data.domainIds?.includes(d)
      );
      if (!hasMatchingDomain) return false;
    }

    if (activeFilters.lenses && activeFilters.lenses.length > 0) {
      const hasMatchingLens = activeFilters.lenses.some(l => 
        node.data.lensIds?.includes(l)
      );
      if (!hasMatchingLens) return false;
    }

    return true;
  });

  // Pan controls - works with hand tool OR space key
  const handleCanvasMouseDown = (e) => {
    if (tool === 'hand' || e.target === containerRef.current || e.target === canvasRef.current || e.target.tagName === 'svg') {
      if (tool === 'hand' || (e.target !== containerRef.current && e.target !== canvasRef.current && e.target.tagName !== 'svg')) {
        return; // Let hand tool work anywhere
      }
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning || tool === 'hand') {
      if (tool === 'hand' && e.buttons === 1) {
        if (!isPanning) {
          setIsPanning(true);
          setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
      }
      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
  const handleResetView = () => {
    setZoom(0.8);
    setPan({ x: 400, y: 200 });
  };

  const handleDomainFocus = (domainId) => {
    if (focusedDomain === domainId) {
      // Exit focus mode
      setFocusedDomain(null);
      handleResetView();
      return;
    }

    // Find the domain node
    const domainNode = nodes.find(n => n.type === 'domain' && n.data.domainId === domainId);
    if (!domainNode) return;

    // Calculate center of domain
    const bounds = getDomainBounds(domainNode);
    const targetZoom = 1.2;
    
    // Center the domain circle on screen
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = (window.innerHeight - 60) / 2 + 60; // -60 for top nav
    
    const targetPanX = viewportCenterX - bounds.centerX * targetZoom;
    const targetPanY = viewportCenterY - bounds.centerY * targetZoom;

    // Animate to focus
    setZoom(targetZoom);
    setPan({ x: targetPanX, y: targetPanY });
    setFocusedDomain(domainId);
  };

  // Exit focus mode with ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && focusedDomain) {
        setFocusedDomain(null);
        handleResetView();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [focusedDomain]);
  // Get cursor based on tool
  const getCursor = () => {
    if (tool === 'hand') return isPanning ? 'grabbing' : 'grab';
    return isPanning ? 'grabbing' : 'default';
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      background: '#0F1724',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navigation Bar */}
<div style={{
  height: '60px',
  background: 'linear-gradient(180deg, #1E293B 0%, #1A2332 100%)',
  borderBottom: '1px solid rgba(108, 99, 255, 0.2)',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  padding: '0 24px',
  gap: '24px',
  zIndex: 100,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
}}>
  {/* Left: Logo + Brand */}
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px'
  }}>
    <img 
      src="/logo.PNG"
      alt="Chroma Logo" 
      style={{
        width: '36px',
        height: '36px',
        filter: 'drop-shadow(0 2px 6px rgba(108, 99, 255, 0.4))'
      }}
    />
    <h1 style={{
      margin: 0,
      fontSize: '20px',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #6C63FF 0%, #4D9FFF 50%, #A78BFA 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '-0.3px'
    }}>
      Chroma
    </h1>
  </div>

  {/* Center: Purpose Title */}
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    {isEditingTitle ? (
      <input
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        onBlur={() => {
          if (editedTitle.trim()) {
            setMapTitle(editedTitle.trim());
          }
          setIsEditingTitle(false);
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            if (editedTitle.trim()) {
              setMapTitle(editedTitle.trim());
            }
            setIsEditingTitle(false);
          }
        }}
        autoFocus
        style={{
          fontSize: '15px',
          fontWeight: 600,
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(108, 99, 255, 0.5)',
          borderRadius: '8px',
          color: '#E6EEF8',
          padding: '8px 12px',
          outline: 'none',
          maxWidth: '280px',
          boxSizing: 'border-box',
          textAlign: 'center'
        }}
      />
    ) : (
      <h2 
        onClick={() => {
          setEditedTitle(mapTitle);
          setIsEditingTitle(true);
        }}
        style={{
          margin: 0,
          fontSize: '15px',
          fontWeight: 600,
          color: '#E6EEF8',
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '8px',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '280px'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(108, 99, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent';
        }}
      >
        {mapTitle}
      </h2>
    )}
  </div>

  {/* Right: Domains + Lenses + Tools */}
  <div style={{ 
    display: 'flex', 
    gap: '12px', 
    alignItems: 'center',
    justifyContent: 'flex-end'
  }}>
    {/* Domains with sliding indicator */}
<div style={{
  position: 'relative',
  display: 'flex',
  gap: '4px',
  padding: '4px',
  background: 'rgba(15, 23, 36, 0.6)',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.08)'
}}>
  {/* Sliding indicator background */}
  {(() => {
    const activeMode = focusedDomain || viewMode;
    const modes = ['all', 'private', 'public', 'abstract'];
    const activeIndex = modes.indexOf(activeMode);
    
    return (
      <div style={{
        position: 'absolute',
        top: '4px',
        left: `${4 + activeIndex * 76}px`,
        width: '72px',
        height: 'calc(100% - 8px)',
        background: activeMode === 'all' ? '#6C63FF' :
                   activeMode === 'private' ? domainColors.private :
                   activeMode === 'public' ? domainColors.public :
                   domainColors.abstract,
        borderRadius: '7px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 0
      }} />
    );
  })()}
  
  {['all', 'private', 'public', 'abstract'].map((mode) => (
    <button
      key={mode}
      onClick={() => {
        setViewMode(mode);
        if (mode !== 'all') {
          handleDomainFocus(mode);
        } else {
          setFocusedDomain(null);
          handleResetView();
        }
      }}
      style={{
        position: 'relative',
        zIndex: 1,
        width: '72px',
        padding: '8px 0',
        background: 'transparent',
        border: 'none',
        borderRadius: '7px',
        color: (focusedDomain === mode || (viewMode === mode && !focusedDomain)) ? '#fff' : '#94A3B8',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: focusedDomain === mode || (viewMode === mode && !focusedDomain) ? 600 : 500,
        textTransform: 'capitalize',
        transition: 'color 0.2s',
        whiteSpace: 'nowrap',
        textAlign: 'center'
      }}
    >
      {mode === 'all' ? 'All' : mode}
    </button>
  ))}
</div>

    {/* Divider */}
    <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.1)' }} />

    {/* Lens Selector */}
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={() => setShowLensDropdown(!showLensDropdown)}
        style={{
          padding: '8px 14px',
          background: 'rgba(15, 23, 36, 0.6)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '8px',
          color: '#E6EEF8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 700,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(236, 72, 153, 0.15)';
          e.target.style.borderColor = 'rgba(236, 72, 153, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(15, 23, 36, 0.6)';
          e.target.style.borderColor = 'rgba(236, 72, 153, 0.3)';
        }}
      >
        <span style={{
          padding: '2px 8px',
          background: '#EC4899',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#fff'
        }}>
          {activeLensIds.length}/{lenses.length}
        </span>
        Lenses
      </button>
      
      <button
        onClick={() => setShowLensManager(true)}
        style={{
          padding: '10px',
          background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(236, 72, 153, 0.4)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 2px 8px rgba(236, 72, 153, 0.4)';
        }}
        title="Manage Lenses"
      >
        <Edit2 size={16} />
      </button>
    </div>

    {/* Divider */}
    <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.1)' }} />

    {/* Tools */}
    <button
      onClick={() => setShowFilters(!showFilters)}
      style={{
        padding: '8px 12px',
        background: showFilters ? '#6C63FF' : 'rgba(15, 23, 36, 0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        color: '#E6EEF8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: 500,
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        if (!showFilters) {
          e.target.style.background = 'rgba(108, 99, 255, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!showFilters) {
          e.target.style.background = 'rgba(15, 23, 36, 0.6)';
        }
      }}
    >
      <Filter size={16} /> Filter
    </button>

    <button
      onClick={() => setShowAnalytics(true)}
      style={{
        padding: '8px 12px',
        background: 'rgba(15, 23, 36, 0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        color: '#E6EEF8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: 500,
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(79, 159, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'rgba(15, 23, 36, 0.6)';
      }}
    >
      <BarChart3 size={16} /> Analytics
    </button>

    <button
      onClick={handleCreateNode}
      style={{
        padding: '8px 16px',
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: 600,
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-1px)';
        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
      }}
    >
      <Plus size={16} /> New Node
    </button>
  </div>
</div>

      {/* Left Sidebar */}
      <LeftSidebar
        onImport={handleImportJSON}
        onExportJSON={handleExportJSON}
        onExportPNG={handleExportPNG}
        onShowPurpose={() => setShowPurposeModal(true)}
        onShowLegend={() => setShowLegend(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        tool={tool}
        onToolChange={setTool}
        onShowPreferences={() => setShowPreferences(true)}
      />

{/* Bottom Right Controls */}
<div style={{
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-end',
  zIndex: 100
}}>
  {/* Personal Links */}
  <div style={{
    display: 'flex',
    gap: '8px',
    padding: '10px 12px',
    background: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(108, 99, 255, 0.2)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  }}>
    <a 
      href="https://github.com/Oceanyx" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        color: '#88CCFF',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.15)';
        e.currentTarget.style.color = '#C7D2FE';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.color = '#88CCFF';
      }}
    >
      <Github size={20} />
    </a>
    <a 
      href="https://www.linkedin.com/in/oceanyx/" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        color: '#4D9FFF',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.15)';
        e.currentTarget.style.color = '#93C5FD';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.color = '#4D9FFF';
      }}
    >
      <Linkedin size={20} />
    </a>
    <a 
      href="mailto:bchanyx@gmail.com"
      style={{
        color: '#10B981',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.15)';
        e.currentTarget.style.color = '#6EE7B7';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.color = '#10B981';
      }}
    >
      <Mail size={20} />
    </a>
    <a 
      href="https://ko-fi.com/oceanyx" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        color: '#FF5E5B',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.15)';
        e.currentTarget.style.color = '#FCA5A5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.color = '#FF5E5B';
      }}
    >
      <Coffee size={20} />
    </a>
  </div>

  {/* New Map Button */}
  <button
    onClick={() => {
      if (window.confirm('Creating a new map will overwrite your current work. Continue?')) {
        window.location.reload();
      }
    }}
    style={{
      padding: '12px 16px',
      background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
      border: 'none',
      borderRadius: '10px',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
      transition: 'all 0.2s',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
    }}
  >
    <Plus size={16} /> New Map
  </button>

  {/* Zoom Controls */}
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
    <button
      onClick={handleZoomIn}
      style={{
        padding: '10px',
        background: '#1E293B',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: '#E6EEF8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title="Zoom In"
    >
      <ZoomIn size={20} />
    </button>
    <button
      onClick={handleResetView}
      style={{
        padding: '10px',
        background: '#1E293B',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: '#E6EEF8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title="Reset View"
    >
      <Maximize2 size={20} />
    </button>
    <button
      onClick={handleZoomOut}
      style={{
        padding: '10px',
        background: '#1E293B',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: '#E6EEF8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title="Zoom Out"
    >
      <ZoomOut size={20} />
    </button>
    <div style={{
      padding: '8px',
      background: '#1E293B',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#94A3B8',
      fontSize: '12px',
      textAlign: 'center'
    }}>
      {Math.round(zoom * 100)}%
    </div>
  </div>
</div>

      {/* Filters Dropdown */}
{showFilters && (
  <div style={{
    position: 'absolute',
    top: '70px',
    right: '20px',
    width: '300px',
    background: '#1E293B',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '16px',
    zIndex: 1001,
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
  }}>
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px', fontWeight: 600 }}>
        Domains
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {['private', 'public', 'abstract'].map(domain => (
          <button
            key={domain}
            onClick={() => toggleFilter('domains', domain)}
            style={{
              padding: '6px 12px',
              background: activeFilters.domains.includes(domain) ? domainColors[domain] : '#0F1724',
              border: `1px solid ${activeFilters.domains.includes(domain) ? domainColors[domain] : 'rgba(148, 163, 184, 0.2)'}`,
              borderRadius: '6px',
              color: activeFilters.domains.includes(domain) ? '#fff' : '#E6EEF8',
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'capitalize',
              fontWeight: activeFilters.domains.includes(domain) ? 600 : 400,
              transition: 'all 0.15s'
            }}
          >
            {domain}
          </button>
        ))}
      </div>
    </div>

    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px', fontWeight: 600 }}>
        Lenses
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {lenses.map(lens => (
          <button
            key={lens.id}
            onClick={() => toggleFilter('lenses', lens.id)}
            style={{
              padding: '6px 12px',
              background: activeFilters.lenses?.includes(lens.id) ? lens.color : '#0F1724',
              border: `1px solid ${activeFilters.lenses?.includes(lens.id) ? lens.color : 'rgba(148, 163, 184, 0.2)'}`,
              borderRadius: '6px',
              color: activeFilters.lenses?.includes(lens.id) ? '#fff' : '#E6EEF8',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeFilters.lenses?.includes(lens.id) ? 600 : 400,
              transition: 'all 0.15s'
            }}
          >
            {lens.name}
          </button>
        ))}
      </div>
    </div>

    <button
      onClick={() => setActiveFilters({ domains: [], lenses: [] })}
      style={{
        width: '100%',
        padding: '8px',
        background: 'transparent',
        fontWeight: 650,
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px',
        color: '#94A3B8',
        cursor: 'pointer',
        fontSize: '13px'
      }}
    >
      Clear All Filters
    </button>
  </div>
)}
      {/* Lens Dropdown */}
      {showLensDropdown && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999
            }}
            onClick={() => setShowLensDropdown(false)}
          />
          <div style={{
            position: 'absolute',
            top: '70px',
            right: '320px',
            width: '280px',
            background: 'linear-gradient(135deg, #1E293B 0%, #1A2332 100%)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#CBD5E1', 
              marginBottom: '12px', 
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Active Lenses
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lenses.map(lens => (
                <button
                  key={lens.id}
                  onClick={() => setActiveLensIds(prev => 
                    prev.includes(lens.id) ? prev.filter(id => id !== lens.id) : [...prev, lens.id]
                  )}
                  style={{
                    padding: '12px 14px',
                    background: activeLensIds.includes(lens.id) 
                      ? `linear-gradient(135deg, ${lens.color}40 0%, ${lens.color}20 100%)` 
                      : 'rgba(15, 23, 36, 0.6)',
                    border: `2px solid ${activeLensIds.includes(lens.id) ? lens.color : 'rgba(148, 163, 184, 0.2)'}`,
                    borderRadius: '8px',
                    color: activeLensIds.includes(lens.id) ? '#fff' : '#CBD5E1',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: activeLensIds.includes(lens.id) ? 700 : 500,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: activeLensIds.includes(lens.id) 
                      ? `0 4px 12px ${lens.color}40` 
                      : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!activeLensIds.includes(lens.id)) {
                      e.target.style.background = 'rgba(30, 41, 59, 0.8)';
                      e.target.style.borderColor = 'rgba(148, 163, 184, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!activeLensIds.includes(lens.id)) {
                      e.target.style.background = 'rgba(15, 23, 36, 0.6)';
                      e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                    }
                  }}
                >
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: activeLensIds.includes(lens.id) 
                      ? lens.color 
                      : 'rgba(148, 163, 184, 0.3)',
                    boxShadow: activeLensIds.includes(lens.id) 
                      ? `0 0 8px ${lens.color}` 
                      : 'none',
                    transition: 'all 0.2s'
                  }} />
                  {lens.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Canvas */}
      <div 
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{ 
          flex: 1,
          position: 'relative',
          cursor: getCursor(),
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        <div 
          ref={canvasRef}
          style={{ 
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundImage: `
              radial-gradient(circle, rgba(30, 41, 59, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        >
          <div style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '10000px',
            height: '10000px',
            position: 'absolute',
            left: '0px',
            top: '0px'
          }}>
            <svg style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
              overflow: 'visible'
            }}>
              <defs>
                {/* Gradient for refines connection */}
                <linearGradient id="refinesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
                </linearGradient>
                {/* Arrow markers */}
                <marker id="arrowInfluences" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#6C63FF" />
                </marker>
                <marker id="arrowRefines" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#F59E0B" />
                </marker>
              </defs>
              {edges.map(edge => {
                const source = filteredNodes.find(n => n.id === edge.source);
                const target = filteredNodes.find(n => n.id === edge.target);
                if (!source || !target) return null;
                
                const start = getNodeCenter(source);
                const end = getNodeCenter(target);
                
                const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
                const connType = connectionTypes.find(c => c.id === edge.type) || connectionTypes[0];
                
                // Fade edges in focus mode
                let edgeOpacity = isHighlighted ? 0.8 : 0.6;
                if (focusedDomain) {
                  const sourceInFocus = source.type === 'content' && source.data.domainIds?.includes(focusedDomain);
                  const targetInFocus = target.type === 'content' && target.data.domainIds?.includes(focusedDomain);
                  if (!sourceInFocus && !targetInFocus) {
                    edgeOpacity = 0.1;
                  }
                }

                // Calculate curved path for contradicts
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2;
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const perpX = -dy * 0.1;
                const perpY = dx * 0.1;
                
                // Determine what label to show
                const displayLabel = edge.label && edge.label !== connType.name ? edge.label : connType.name;
                
                return (
                  <g key={edge.id}>
                    {edge.type === 'contradicts' ? (
                      <path
                        d={`M ${start.x} ${start.y} Q ${midX + perpX} ${midY + perpY} ${end.x} ${end.y}`}
                        stroke={isHighlighted ? '#FFFFFF' : connType.color}
                        strokeWidth={isHighlighted ? 3 : 2}
                        opacity={edgeOpacity}
                        fill="none"
                        strokeDasharray={connType.strokeDasharray}
                        style={{ transition: 'all 0.2s' }}
                      />
                    ) : (
                      <line
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke={connType.gradient ? 'url(#refinesGradient)' : (isHighlighted ? '#FFFFFF' : connType.color)}
                        strokeWidth={isHighlighted ? 3 : 2}
                        opacity={edgeOpacity}
                        strokeDasharray={connType.strokeDasharray}
                        markerEnd={connType.arrow ? (edge.type === 'refines' ? 'url(#arrowRefines)' : 'url(#arrowInfluences)') : 'none'}
                        style={{ transition: 'all 0.2s' }}
                      />
                    )}
                    <text
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 - 5}
                      fill={isHighlighted ? '#FFFFFF' : connType.color}
                      fontSize="14px"
                      fontWeight="500"
                      textAnchor="middle"
                      style={{ pointerEvents: 'none' }}
                    >
                      {displayLabel}
                    </text>
                  </g>
                );
              })}
            </svg>

            {console.log('Filtered nodes:', filteredNodes.map(n => ({ id: n.id, type: n.type, position: n.position })))}
            {filteredNodes.map(node => {
              // Calculate opacity based on focus mode
              let opacity = 1;
              if (focusedDomain) {
                if (node.type === 'domain') {
                  opacity = node.data.domainId === focusedDomain ? 1 : 0.15;
                } else if (node.type === 'content') {
                  opacity = node.data.domainIds?.includes(focusedDomain) ? 1 : 0.2;
                }
              }

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: node.position.x,
                    top: node.position.y,
                    pointerEvents: tool === 'hand' ? 'none' : 'auto',
                    opacity: opacity,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                <Node
                  node={{ ...node, position: { x: 0, y: 0 } }}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onClick={handleNodeClick}
                  onHover={handleNodeHover}
                  onLeave={handleNodeLeave}
                  isDragging={draggingNode === node.id}
                  isHovered={hoveredNode === node.id}
                  activeLensIds={activeLensIds}
                  blendColors={blendColors}
                  lenses={lenses}
                />
              </div>
            )})}
          </div>
        </div>
      </div>

      {selectedNode && nodeDetailMode === 'sidebar' && (
        <NodeDetailPanel
          key={selectedNode.id}
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
          lenses={lenses}
          edges={edges}
          nodes={nodes}
          onDeleteEdge={handleDeleteEdge}
          onCreateEdge={handleCreateEdge}
          onUpdateEdge={handleUpdateEdge}
          recentMetaTags={recentMetaTags}
          onAddRecentMetaTag={addRecentMetaTag}
        />
      )}

      {showAnalytics && (
        <AnalyticsPanel
          nodes={nodes}
          lenses={lenses}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {showLensManager && (
        <LensManager
          lenses={lenses}
          onClose={() => setShowLensManager(false)}
          onUpdate={handleUpdateLenses}
        />
        )}
      {showPurposeModal && purposeData && (
        <PurposeModal
          purposeData={purposeData}
          onClose={() => setShowPurposeModal(false)}
          onEdit={() => {
            setShowPurposeModal(false);
            // TODO: Re-open purpose screen for editing
            alert('Edit purpose: Coming soon!');
          }}
        />
      )}
      {showLegend && (
        <LegendModal
          lenses={lenses}
          onClose={() => setShowLegend(false)}
        />
      )}
      {showPreferences && (
        <PreferencesModal
          onClose={() => setShowPreferences(false)}
          nodeDetailMode={nodeDetailMode}
          onSave={(mode) => setNodeDetailMode(mode)}
        />
      )}
       {/* Copyright Footer */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '11px',
        color: '#475569',
        zIndex: 50,
        pointerEvents: 'none'
      }}>
        © 2025 Oceanyx · Brian Chan
      </div>
    </div>
  );
}
