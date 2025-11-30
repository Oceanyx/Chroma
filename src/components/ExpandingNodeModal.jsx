// src/components/ExpandingNodeModal.jsx
import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Heart, MessageCircle, Brain, Trash2 } from 'lucide-react';
import { domainColors } from '../seedData';

export default function ExpandingNodeModal({ 
  node, 
  onClose, 
  onUpdate, 
  onDelete,
  lenses 
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

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '40px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #1A2332 100%)',
          borderRadius: '20px',
          width: '700px',
          maxWidth: '90vw',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(108, 99, 255, 0.3)',
          boxShadow: '0 24px 72px rgba(0, 0, 0, 0.6)',
          animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Seed title..."
            style={{
              fontSize: '20px',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              color: '#E6EEF8',
              outline: 'none',
              flex: 1,
              marginRight: '16px'
            }}
          />
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDelete}
              style={{
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#EF4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              <Trash2 size={16} /> Delete
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(108, 99, 255, 0.3) transparent'
        }}>
          {/* Quick Capture - Always Visible */}
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(108, 99, 255, 0.2)',
            borderRadius: '12px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#94A3B8',
              marginBottom: '10px'
            }}>
              Quick Capture
            </label>
            <textarea
              value={formData.rawCapture}
              onChange={(e) => setFormData(prev => ({ ...prev, rawCapture: e.target.value }))}
              placeholder="What did you notice? What happened?"
              rows={4}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0A0F1A',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '8px',
                color: '#E6EEF8',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.6',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Configuration */}
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '15px',
              fontWeight: 600,
              color: '#E6EEF8'
            }}>
              Configuration
            </h3>

            {/* Domain Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#94A3B8',
                marginBottom: '8px'
              }}>
                Active Domains
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['private', 'public', 'abstract'].map(domain => {
                  const Icon = domainIcons[domain];
                  return (
                    <button
                      key={domain}
                      onClick={() => toggleDomainSelection(domain)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: formData.domainIds.includes(domain) 
                          ? domainColors[domain] 
                          : '#1E293B',
                        border: `1px solid ${formData.domainIds.includes(domain) 
                          ? domainColors[domain] 
                          : 'rgba(148, 163, 184, 0.2)'}`,
                        borderRadius: '8px',
                        color: formData.domainIds.includes(domain) ? '#000' : '#E6EEF8',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Icon size={16} />
                      {domain}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lens Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#94A3B8',
                marginBottom: '8px'
              }}>
                Lenses (Optional)
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {lenses.map(lens => (
                  <button
                    key={lens.id}
                    onClick={() => toggleLens(lens.id)}
                    style={{
                      padding: '8px 14px',
                      background: formData.lensIds.includes(lens.id) 
                        ? lens.color 
                        : '#1E293B',
                      border: `1px solid ${formData.lensIds.includes(lens.id) 
                        ? lens.color 
                        : 'rgba(148, 163, 184, 0.2)'}`,
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: formData.lensIds.includes(lens.id) ? 600 : 400,
                      transition: 'all 0.2s'
                    }}
                  >
                    {lens.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expand Domains Button */}
          <button
            onClick={() => {
              const allCollapsed = !expandedDomains.private && !expandedDomains.public && !expandedDomains.abstract;
              if (allCollapsed) {
                // Expand all active domains
                const newExpanded = {};
                formData.domainIds.forEach(id => {
                  newExpanded[id] = true;
                });
                setExpandedDomains(newExpanded);
              } else {
                // Collapse all
                setExpandedDomains({ private: false, public: false, abstract: false });
              }
            }}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(108, 99, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(108, 99, 255, 0.3)';
            }}
          >
            {(!expandedDomains.private && !expandedDomains.public && !expandedDomains.abstract) 
              ? '🌰 Expand for Reflection' 
              : '🌱 Collapse Domains'}
          </button>

          {/* Domain Accordions */}
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
                    padding: '14px',
                    background: `${domainColors[domainId]}15`,
                    border: `1px solid ${domainColors[domainId]}40`,
                    borderRadius: '10px',
                    color: '#E6EEF8',
                    cursor: isActive ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '15px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} color={domainColors[domainId]} />
                    {domainId}
                  </div>
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                {isExpanded && isActive && (
                  <div style={{
                    marginTop: '8px',
                    padding: '16px',
                    background: '#0A0F1A',
                    border: `1px solid ${domainColors[domainId]}20`,
                    borderRadius: '10px',
                    animation: 'slideUp 0.2s ease'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#94A3B8',
                      marginBottom: '10px',
                      fontStyle: 'italic'
                    }}>
                      {domainDescriptions[domainId]}
                    </div>
                    <textarea
                      value={formData.domains[domainId] || ''}
                      onChange={(e) => updateDomainContent(domainId, e.target.value)}
                      placeholder={`What's happening in the ${domainId} domain?`}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#1E293B',
                        border: `1px solid ${domainColors[domainId]}30`,
                        borderRadius: '8px',
                        color: '#E6EEF8',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        resize: 'vertical',
                        lineHeight: '1.6',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
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
              background: '#10B981',
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
    </div>
  );
}