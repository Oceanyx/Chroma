// src/components/LegendModal.jsx
import React from 'react';
import { X, Map, Circle, Tag, Zap } from 'lucide-react';
import { domainColors, connectionTypes, modes, agencyStates } from '../seedData';

export default function LegendModal({ lenses, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: '700px',
        maxWidth: '90vw',
        maxHeight: '85vh',
        background: '#0F1724',
        borderRadius: '16px',
        border: '1px solid rgba(108, 99, 255, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        color: '#E6EEF8',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Map size={20} color="#4D9FFF" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Map Legend</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {/* Domains */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <Circle size={18} color="#FFB84D" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#E6EEF8' }}>
                Domains
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px', lineHeight: '1.6' }}>
              Domains represent different spheres of experience where patterns occur.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(domainColors).map(([domain, color]) => (
                <div key={domain} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: '8px',
                  border: `1px solid ${color}40`
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `${color}30`,
                    border: `2px solid ${color}`,
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#E6EEF8', textTransform: 'capitalize', marginBottom: '2px' }}>
                      {domain}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                      {domain === 'private' && 'Internal experiences, thoughts, and feelings'}
                      {domain === 'public' && 'Social interactions and relationships'}
                      {domain === 'abstract' && 'Concepts, frameworks, and meaning-making'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lenses */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <Tag size={18} color="#EC4899" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#E6EEF8' }}>
                Lenses
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px', lineHeight: '1.6' }}>
              A lens is the interpretive frame that determines how you make sense of the pattern and what aspects become meaningful.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {lenses.map(lens => (
                <div key={lens.id} style={{
                  padding: '8px 14px',
                  background: `${lens.color}20`,
                  border: `1px solid ${lens.color}60`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#E6EEF8',
                  fontWeight: 500
                }}>
                  {lens.name}
                </div>
              ))}
            </div>
          </div>

          {/* Connection Types */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <Zap size={18} color="#6C63FF" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#E6EEF8' }}>
                Connections
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px', lineHeight: '1.6' }}>
              Connections show the relationship between nodes(perception instances).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {connectionTypes.map(conn => (
                <div key={conn.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: '8px',
                  border: `1px solid ${conn.color}40`
                }}>
                  <svg width="40" height="20" style={{ flexShrink: 0 }}>
                    <line
                      x1="0"
                      y1="10"
                      x2="40"
                      y2="10"
                      stroke={conn.color}
                      strokeWidth="2"
                      strokeDasharray={conn.strokeDasharray}
                    />
                    {conn.arrow && (
                      <polygon
                        points="40,10 35,7 35,13"
                        fill={conn.color}
                      />
                    )}
                  </svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: conn.color, marginBottom: '2px' }}>
                      {conn.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                      {conn.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modes */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <Circle size={18} color="#10B981" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#E6EEF8' }}>
                Modes
              </h3>
            </div>
            {/* <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px', lineHeight: '1.6' }}>
              Modes describe how you're engaging with the pattern.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {modes.map(mode => (
                <div key={mode.id} style={{
                  padding: '10px 12px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#E6EEF8', textTransform: 'capitalize', marginBottom: '2px' }}>
                    {mode.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {mode.description}
                  </div>
                </div>
              ))}
            </div> */}
          </div>

          {/* Agency States */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <Zap size={18} color="#F59E0B" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#E6EEF8' }}>
                Agency Orientations
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px', lineHeight: '1.6' }}>
              How you're relating to a perception instance in terms of agency and choice.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {agencyStates.map(state => (
                <div key={state.id} style={{
                  padding: '10px 12px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#E6EEF8', textTransform: 'capitalize', marginBottom: '2px' }}>
                    {state.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {state.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}