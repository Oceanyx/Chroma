// src/components/LeftSidebar.jsx
import React, { useState } from 'react';
import { Upload, FileJson, Camera, Target, Map, MousePointer, Hand, ExternalLink, Coffee, Undo, Redo, Settings } from 'lucide-react';

export default function LeftSidebar({ 
  onImport, 
  onExportJSON, 
  onExportPNG, 
  onShowPurpose, 
  onShowLegend,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  tool,
  onToolChange,
  onShowPreferences
}) {
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const iconButtons = [
      { id: 'import', icon: Upload, label: 'Import Map', action: onImport, color: '#10B981', hoverBg: 'rgba(16, 185, 129, 0.2)' },
      { id: 'export-json', icon: FileJson, label: 'Export JSON', action: onExportJSON, color: '#6C63FF', hoverBg: 'rgba(108, 99, 255, 0.2)' },
      { id: 'export-png', icon: Camera, label: 'Export PNG', action: onExportPNG, color: '#A78BFA', hoverBg: 'rgba(167, 139, 250, 0.2)' },
      { id: 'purpose', icon: Target, label: 'View Purpose', action: onShowPurpose, color: '#F59E0B', hoverBg: 'rgba(245, 158, 11, 0.2)' },
      { id: 'legend', icon: Map, label: 'Legend', action: onShowLegend, color: '#4D9FFF', hoverBg: 'rgba(77, 159, 255, 0.2)' },
    ];

  const toolButtons = [
    { id: 'undo', icon: Undo, label: 'Undo (Ctrl+Z)', action: onUndo, color: '#94A3B8', disabled: !canUndo },
    { id: 'redo', icon: Redo, label: 'Redo (Ctrl+Shift+Z)', action: onRedo, color: '#94A3B8', disabled: !canRedo },
    { id: 'preferences', icon: Settings, label: 'Preferences', action: onShowPreferences, color: '#94A3B8' },
    { id: 'select', icon: MousePointer, label: 'Select Tool (V)' },
    { id: 'hand', icon: Hand, label: 'Hand Tool (H)' }
  ];

return (
    <>
      {/* Action buttons - top left */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 100
      }}>
        {iconButtons.map(btn => {
          const Icon = btn.icon;
          const isHovered = hoveredIcon === btn.id;
          
          return (
            <div key={btn.id} style={{ position: 'relative' }}>
              <button
                onClick={btn.action}
                onMouseEnter={() => setHoveredIcon(btn.id)}
                onMouseLeave={() => setHoveredIcon(null)}
                style={{
                  padding: '10px',
                  background: isHovered ? btn.hoverBg : '#1E293B',
                  border: `1px solid ${isHovered ? btn.color + '60' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: '#E6EEF8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isHovered ? `0 4px 12px ${btn.color}40` : 'none'
                }}
              >
                <Icon size={20} color={isHovered ? btn.color : '#E6EEF8'} />
              </button>
                            
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  left: '52px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1E293B',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                  color: '#E6EEF8',
                  pointerEvents: 'none',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  {btn.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tool selector - bottom left */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 100
      }}>
        {toolButtons.map(btn => {
          const Icon = btn.icon;
          const isActive = tool === btn.id;
          const isHovered = hoveredIcon === btn.id;
          
          return (
            <div key={btn.id} style={{ position: 'relative' }}>
              <button
                onClick={btn.action || (() => onToolChange(btn.id))}
                disabled={btn.disabled}
                onMouseEnter={() => setHoveredIcon(btn.id)}
                onMouseLeave={() => setHoveredIcon(null)}
                style={{
                  padding: '10px',
                  background: isActive ? '#6C63FF' : '#1E293B',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#E6EEF8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={20} />
              </button>
              
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  left: '52px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1E293B',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                  color: '#E6EEF8',
                  pointerEvents: 'none',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  {btn.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}