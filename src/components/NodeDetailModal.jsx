import React, { useState } from 'react';
import { X, Trash2, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import { domainColors, modes, agencyOrientations, patternTypes, predefinedMetaTags, defaultLenses } from '../seedData';

export default function NodeDetailModal({
  node,
  onClose,
  onUpdate,
  onDelete,
  lenses,
  edges,
  nodes,
  onDeleteEdge,
  onCreateEdge,
  onUpdateEdge,
  recentMetaTags,
  onAddRecentMetaTag
}) {
  const [showDomainGuide, setShowDomainGuide] = useState(false);
  const [showLensGuide, setShowLensGuide] = useState(false);

  const incomingEdges = edges.filter(e => e.target === node.id);
  const outgoingEdges = edges.filter(e => e.source === node.id);

  const sectionStyle = {
    background: 'rgba(30, 41, 59, 0.4)',
    border: '1px solid rgba(108, 99, 255, 0.2)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#94A3B8',
    marginBottom: '8px',
    letterSpacing: '0.3px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#0F1724',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#E6EEF8',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
    lineHeight: '1.5'
  };

  const handleUpdate = (field, value) => {
    onUpdate(node.id, { [field]: value });
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
        padding: '40px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1E293B',
          borderRadius: '16px',
          width: '900px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(108, 99, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
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
            value={node.data.title || ''}
            onChange={(e) => handleUpdate('title', e.target.value)}
            placeholder="Node Title"
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
              onClick={() => {
                if (window.confirm('Delete this node permanently?')) {
                  onDelete(node.id);
                  onClose();
                }
              }}
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
          {/* Configuration Section */}
          <div style={sectionStyle}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <SettingsIcon size={18} style={{ color: '#6C63FF' }} />
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: '#E6EEF8'
              }}>
                Configuration
              </h3>
            </div>

            {/* Domains */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <label style={labelStyle}>Domains</label>
                <button
                  onClick={() => setShowDomainGuide(!showDomainGuide)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6C63FF',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Domain Guidance"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['private', 'public', 'abstract'].map(domain => (
                  <button
                    key={domain}
                    onClick={() => {
                      const current = node.data.domainIds || [];
                      const updated = current.includes(domain)
                        ? current.filter(d => d !== domain)
                        : [...current, domain];
                      handleUpdate('domainIds', updated);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: node.data.domainIds?.includes(domain) ? domainColors[domain] : '#0F1724',
                      border: `1px solid ${node.data.domainIds?.includes(domain) ? domainColors[domain] : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '8px',
                      color: node.data.domainIds?.includes(domain) ? '#000' : '#E6EEF8',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            {/* Lenses */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <label style={labelStyle}>Lenses</label>
                <button
                  onClick={() => setShowLensGuide(!showLensGuide)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6C63FF',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Lens Guidance"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {lenses.map(lens => (
                  <button
                    key={lens.id}
                    onClick={() => {
                      const current = node.data.lensIds || [];
                      const updated = current.includes(lens.id)
                        ? current.filter(id => id !== lens.id)
                        : [...current, lens.id];
                      handleUpdate('lensIds', updated);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: node.data.lensIds?.includes(lens.id) ? lens.color : '#0F1724',
                      border: `1px solid ${node.data.lensIds?.includes(lens.id) ? lens.color : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '8px',
                      color: node.data.lensIds?.includes(lens.id) ? '#fff' : '#E6EEF8',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    {lens.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Domain Guide */}
          {showDomainGuide && (
            <div style={{
              ...sectionStyle,
              background: 'rgba(108, 99, 255, 0.1)',
              border: '1px solid rgba(108, 99, 255, 0.3)'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#6C63FF', fontSize: '14px', fontWeight: 600 }}>
                Domain Guidance
              </h4>
              <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: '#FFD93D' }}>Private:</strong> Internal experiences, thoughts, feelings</p>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: '#6BCF7F' }}>Public:</strong> External actions, interactions, observable behaviors</p>
                <p style={{ margin: '0 0 0 0' }}><strong style={{ color: '#A78BFA' }}>Abstract:</strong> Concepts, frameworks, patterns, theories</p>
              </div>
            </div>
          )}

          {/* Lens Guide */}
          {showLensGuide && (
            <div style={{
              ...sectionStyle,
              background: 'rgba(108, 99, 255, 0.1)',
              border: '1px solid rgba(108, 99, 255, 0.3)'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#6C63FF', fontSize: '14px', fontWeight: 600 }}>
                Lens Guidance
              </h4>
              <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.6' }}>
                {lenses.map(lens => (
                  <p key={lens.id} style={{ margin: '0 0 8px 0' }}>
                    <strong style={{ color: lens.color }}>{lens.name}:</strong> {lens.question}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Two Column Layout for Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Left Column */}
            <div>
              {/* What I Notice */}
              <div style={sectionStyle}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#E6EEF8'
                }}>
                  👁️ What I Notice
                </h3>
                
                <label style={labelStyle}>Perceived Pattern</label>
                <textarea
                  value={node.data.perceivedPattern || ''}
                  onChange={(e) => handleUpdate('perceivedPattern', e.target.value)}
                  placeholder="What pattern am I noticing?"
                  style={textareaStyle}
                />

                <label style={{ ...labelStyle, marginTop: '16px' }}>Pattern Type</label>
                <select
                  value={node.data.patternType || 'trigger'}
                  onChange={(e) => handleUpdate('patternType', e.target.value)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer'
                  }}
                >
                  {patternTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>

                <label style={{ ...labelStyle, marginTop: '16px' }}>Meta-tags</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {(node.data.metaTags || []).map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(108, 99, 255, 0.2)',
                        border: '1px solid rgba(108, 99, 255, 0.4)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#A78BFA',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const updated = node.data.metaTags.filter((_, idx) => idx !== i);
                        handleUpdate('metaTags', updated);
                      }}
                    >
                      {tag} ×
                    </span>
                  ))}
                </div>
              </div>

              {/* Felt Sense */}
              <div style={sectionStyle}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#E6EEF8'
                }}>
                  ❤️ Felt Sense
                </h3>
                
                <textarea
                  value={node.data.feltSense || ''}
                  onChange={(e) => handleUpdate('feltSense', e.target.value)}
                  placeholder="What am I feeling in my body?"
                  style={textareaStyle}
                />
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* How I'm Making Sense */}
              <div style={sectionStyle}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#E6EEF8'
                }}>
                  🧠 How I'm Making Sense
                </h3>
                
                <label style={labelStyle}>Interpretation</label>
                <textarea
                  value={node.data.interpretation || ''}
                  onChange={(e) => handleUpdate('interpretation', e.target.value)}
                  placeholder="What story am I telling about this?"
                  style={textareaStyle}
                />

                <label style={{ ...labelStyle, marginTop: '16px' }}>Active Questions</label>
                <textarea
                  value={node.data.activeQuestions || ''}
                  onChange={(e) => handleUpdate('activeQuestions', e.target.value)}
                  placeholder="What am I curious about?"
                  style={{ ...textareaStyle, minHeight: '80px' }}
                />

                <label style={{ ...labelStyle, marginTop: '16px' }}>Agency Orientation</label>
                <select
                  value={node.data.agencyOrientation || 'curious'}
                  onChange={(e) => handleUpdate('agencyOrientation', e.target.value)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer'
                  }}
                >
                  {agencyOrientations.map(orientation => (
                    <option key={orientation.id} value={orientation.id}>
                      {orientation.icon} {orientation.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Notes */}
              <div style={sectionStyle}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#E6EEF8'
                }}>
                  📝 Notes
                </h3>
                
                <textarea
                  value={node.data.notes || ''}
                  onChange={(e) => handleUpdate('notes', e.target.value)}
                  placeholder="Additional thoughts..."
                  style={{ ...textareaStyle, minHeight: '120px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}