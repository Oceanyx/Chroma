import React from 'react';
import { X } from 'lucide-react';

export default function PreferencesModal({ onClose, nodeDetailMode, onSave }) {
  const [selectedMode, setSelectedMode] = React.useState(nodeDetailMode);

  const handleSave = () => {
    localStorage.setItem('chroma-node-detail-mode', selectedMode);
    onSave(selectedMode);
    onClose();
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
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1E293B',
          borderRadius: '16px',
          padding: '24px',
          width: '500px',
          maxWidth: '90vw',
          border: '1px solid rgba(108, 99, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            color: '#E6EEF8'
          }}>
            Preferences
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Node Detail Display Preference */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#94A3B8',
            marginBottom: '12px'
          }}>
            Node Detail Display
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: selectedMode === 'sidebar' ? 'rgba(108, 99, 255, 0.15)' : '#0F1724',
              border: `1px solid ${selectedMode === 'sidebar' ? '#6C63FF' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="nodeDetailMode"
                value="sidebar"
                checked={selectedMode === 'sidebar'}
                onChange={(e) => setSelectedMode(e.target.value)}
                style={{ cursor: 'pointer' }}
              />
              <div>
                <div style={{ color: '#E6EEF8', fontWeight: 500, fontSize: '14px' }}>
                  Sidebar Panel
                </div>
                <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                  Node details appear on the right side
                </div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: selectedMode === 'modal' ? 'rgba(108, 99, 255, 0.15)' : '#0F1724',
              border: `1px solid ${selectedMode === 'modal' ? '#6C63FF' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="nodeDetailMode"
                value="modal"
                checked={selectedMode === 'modal'}
                onChange={(e) => setSelectedMode(e.target.value)}
                style={{ cursor: 'pointer' }}
              />
              <div>
                <div style={{ color: '#E6EEF8', fontWeight: 500, fontSize: '14px' }}>
                  Center Modal
                </div>
                <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                  Node details appear in a centered modal
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '12px',
            background: '#6C63FF',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#5A52D5'}
          onMouseLeave={(e) => e.target.style.background = '#6C63FF'}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}