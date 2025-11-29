// src/components/SeedDetailPanel.jsx
import React, { useState } from 'react';
import { X, Trash2, ChevronDown, ChevronRight, Heart, MessageCircle, Brain, Settings as SettingsIcon } from 'lucide-react';
import { domainColors, connectionTypes } from '../seedData';

export default function SeedDetailPanel({
  node,
  onClose,
  onUpdate,
  onDelete,
  lenses,
  edges,
  nodes,
  onDeleteEdge,
  onCreateEdge,
  onUpdateEdge
}) {
  const [formData, setFormData] = useState({
    title: node.data.title || '',
    rawCapture: node.data.rawCapture || '',
    domains: node.data.domains || {
      private: null,
      public: null,
      abstract: null
    },
    lensIds: node.data.lensIds || [],
    domainIds: node.data.domainIds || [],
    notes: node.data.notes || ''
  });

  const [expandedDomains, setExpandedDomains] = useState({
    private: false,
    public: false,
    abstract: false
  });

  const [showConnections, setShowConnections] = useState(false);

  const toggleDomain = (domainId) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domainId]: !prev[domainId]
    }));
  };

  const toggleDomainSelection = (domainId) => {
    setFormData(prev => ({
      ...prev,
      domainIds: prev.domainIds.includes(domainId)
        ? prev.domainIds.filter(id => id !== domainId)
        : [...prev.domainIds, domainId]
    }));
  };

  const toggleLens = (lensId) => {
    setFormData(prev => ({
      ...prev,
      lensIds: prev.lensIds.includes(lensId)
        ? prev.lensIds.filter(id => id !== lensId)
        : [...prev.lensIds, lensId]
    }));
  };

  const updateDomainContent = (domainId, content) => {
    setFormData(prev => ({
      ...prev,
      domains: {
        ...prev.domains,
        [domainId]: content
      }
    }));
  };

  const handleSave = () => {
    onUpdate(node.id, formData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Delete this seed?')) {
      onDelete(node.id);
      onClose();
    }
  };

  const nodeEdges = edges.filter(e => e.source === node.id || e.target === node.id);

  const domainIcons = {
    private: Heart,
    public: MessageCircle,
    abstract: Brain
  };

  const domainDescriptions = {
    private: 'Internal experiences, sensations, feelings',
    public: 'External actions, interactions, observable behaviors',
    abstract: 'Concepts, frameworks, interpretations'
  };

  const sectionStyle = {
    marginBottom: '16px',
    padding: '14px',
    background: 'rgba(30, 41, 59, 0.4)',
    border: '1px solid rgba(108, 99, 255, 0.2)',
    borderRadius: '10px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#0A0F1A',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '6px',
    color: '#E6EEF8',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#94A3B8',
    marginBottom: '6px'
  };

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: '60px',
      bottom: 0,
      width: '450px',
      background: '#0F1724',
      borderLeft: '1px solid rgba(108, 99, 255, 0.3)',
      borderTop: '1px solid rgba(108, 99, 255, 0.3)',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      color: '#E6EEF8'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Seed title..."
          style={{
            fontSize: '16px',
            fontWeight: 600,
            background: 'transparent',
            border: 'none',
            color: '#E6EEF8',
            outline: 'none',
            flex: 1
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleDelete}
            style={{
              padding: '6px',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              color: '#EF4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '6px 8px',
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '18px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(108, 99, 255, 0.3) transparent'
      }}>
        {/* Quick Capture */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Quick Capture</label>
          <textarea
            value={formData.rawCapture}
            onChange={(e) => setFormData(prev => ({ ...prev, rawCapture: e.target.value }))}
            placeholder="What did you notice? What happened?"
            rows={3}
            style={inputStyle}
          />
          <div style={{
            fontSize: '11px',
            color: '#64748B',
            marginTop: '6px',
            fontStyle: 'italic'
          }}>
            Capture the moment. Expand domains below when ready.
          </div>
        </div>

        {/* Configuration */}
        <div style={sectionStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <SettingsIcon size={16} style={{ color: '#6C63FF' }} />
            <h3 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 600,
              color: '#E6EEF8'
            }}>
              Configuration
            </h3>
          </div>

          {/* Domain Selection */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Active Domains</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['private', 'public', 'abstract'].map(domain => {
                const Icon = domainIcons[domain];
                return (
                  <button
                    key={domain}
                    onClick={() => toggleDomainSelection(domain)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: formData.domainIds.includes(domain) 
                        ? domainColors[domain] 
                        : '#1E293B',
                      border: `1px solid ${formData.domainIds.includes(domain) 
                        ? domainColors[domain] 
                        : 'rgba(148, 163, 184, 0.2)'}`,
                      borderRadius: '6px',
                      color: formData.domainIds.includes(domain) ? '#000' : '#E6EEF8',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Icon size={14} />
                    {domain}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lens Selection */}
          <div>
            <label style={labelStyle}>Lenses (Optional)</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {lenses.map(lens => (
                <button
                  key={lens.id}
                  onClick={() => toggleLens(lens.id)}
                  style={{
                    padding: '6px 12px',
                    background: formData.lensIds.includes(lens.id) 
                      ? lens.color 
                      : '#1E293B',
                    border: `1px solid ${formData.lensIds.includes(lens.id) 
                      ? lens.color 
                      : 'rgba(148, 163, 184, 0.2)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: formData.lensIds.includes(lens.id) ? 600 : 400
                  }}
                >
                  {lens.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Domain Panels */}
        {['private', 'public', 'abstract'].map(domainId => {
          const Icon = domainIcons[domainId];
          const isExpanded = expandedDomains[domainId];
          const isActive = formData.domainIds.includes(domainId);

          return (
            <div
              key={domainId}
              style={{
                marginBottom: '12px',
                opacity: isActive ? 1 : 0.5,
                pointerEvents: isActive ? 'auto' : 'none'
              }}
            >
              <button
                onClick={() => toggleDomain(domainId)}
                disabled={!isActive}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: `${domainColors[domainId]}15`,
                  border: `1px solid ${domainColors[domainId]}40`,
                  borderRadius: '8px',
                  color: '#E6EEF8',
                  cursor: isActive ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} color={domainColors[domainId]} />
                  {domainId}
                </div>
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isExpanded && isActive && (
                <div style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: '#0A0F1A',
                  border: `1px solid ${domainColors[domainId]}20`,
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#94A3B8',
                    marginBottom: '8px',
                    fontStyle: 'italic'
                  }}>
                    {domainDescriptions[domainId]}
                  </div>
                  <textarea
                    value={formData.domains[domainId] || ''}
                    onChange={(e) => updateDomainContent(domainId, e.target.value)}
                    placeholder={`What's happening in the ${domainId} domain?`}
                    rows={4}
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Notes */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional thoughts..."
            rows={3}
            style={inputStyle}
          />
        </div>

        {/* Connections */}
        <div style={sectionStyle}>
          <button
            onClick={() => setShowConnections(!showConnections)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '6px',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Connections ({nodeEdges.length})</span>
            {showConnections ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {showConnections && nodeEdges.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nodeEdges.map(edge => {
                const isSource = edge.source === node.id;
                const otherId = isSource ? edge.target : edge.source;
                const otherNode = nodes.find(n => n.id === otherId);
                const connType = connectionTypes.find(c => c.id === edge.type) || connectionTypes[0];

                return (
                  <div
                    key={edge.id}
                    style={{
                      padding: '10px',
                      background: '#0A0F1A',
                      border: `1px solid ${connType.color}30`,
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ color: '#E6EEF8', fontWeight: 500, marginBottom: '4px' }}>
                      {isSource ? '→' : '←'} {otherNode?.data.title || 'Unknown'}
                    </div>
                    <div style={{ color: connType.color, fontSize: '11px' }}>
                      {connType.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div style={{
          fontSize: '11px',
          color: '#64748B',
          textAlign: 'center',
          paddingTop: '8px'
        }}>
          {node.data.timestamp ? new Date(node.data.timestamp).toLocaleString() : 'No timestamp'}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '12px',
            background: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '8px',
            color: '#94A3B8',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: '12px',
            background: '#6C63FF',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}