// src/components/LensManager.jsx
import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';

export default function LensManager({ lenses, onClose, onUpdate }) {
  const [editingLenses, setEditingLenses] = useState([...lenses.map(l => ({
    ...l,
    questions: l.questions || ['', '']
  }))]);
  const [newLens, setNewLens] = useState({ name: '', color: '#6C63FF', questions: ['', ''] });
  const handleAddLens = () => {
    if (newLens.name && editingLenses.length < 10) {
      setEditingLenses([...editingLenses, {
        id: newLens.name.toLowerCase().replace(/\s+/g, '-'),
        name: newLens.name,
        color: newLens.color,
        questions: newLens.questions || ['', '']
      }]);
      setNewLens({ name: '', color: '#6C63FF', questions: ['', ''] });
    }
  };

  const handleDeleteLens = (lensId) => {
    setEditingLenses(editingLenses.filter(l => l.id !== lensId));
  };

  const handleUpdateLens = (lensId, field, value, questionIndex) => {
    setEditingLenses(editingLenses.map(l => {
      if (l.id === lensId) {
        if (field === 'question') {
          const newQuestions = [...(l.questions || ['', ''])];
          newQuestions[questionIndex] = value;
          return { ...l, questions: newQuestions };
        }
        return { ...l, [field]: value };
      }
      return l;
    }));
  };

  const handleSave = () => {
    onUpdate(editingLenses);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000
    }}>
      <div style={{
        width: '500px',
        maxHeight: '80vh',
        background: '#0F1724',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        color: '#E6EEF8'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Manage Lenses</h2>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0 8px'
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#94A3B8' }}>
              Add New Lens ({editingLenses.length}/10)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                value={newLens.name}
                onChange={e => setNewLens(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Lens name..."
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#1E293B',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#E6EEF8',
                  fontSize: '14px'
                }}
              />
              <input
                type="color"
                value={newLens.color}
                onChange={e => setNewLens(prev => ({ ...prev, color: e.target.value }))}
                style={{
                  width: '50px',
                  height: '38px',
                  background: '#1E293B',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              />
              <button
                onClick={handleAddLens}
                disabled={!newLens.name || editingLenses.length >= 10}
                style={{
                  padding: '8px 12px',
                  background: newLens.name && editingLenses.length < 10 ? '#10B981' : '#1E293B',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: newLens.name && editingLenses.length < 10 ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px', color: '#94A3B8' }}>
              Existing Lenses
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {editingLenses.map(lens => (
                <div key={lens.id} style={{
                  padding: '16px',
                  background: '#1E293B',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <input
                      type="color"
                      value={lens.color}
                      onChange={e => handleUpdateLens(lens.id, 'color', e.target.value)}
                      style={{
                        width: '40px',
                        height: '40px',
                        background: lens.color,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      value={lens.name}
                      onChange={e => handleUpdateLens(lens.id, 'name', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#0F1724',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: '#E6EEF8',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={() => handleDeleteLens(lens.id)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div style={{ marginLeft: '48px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '12px', 
                      color: '#94A3B8', 
                      marginBottom: '8px',
                      fontWeight: 500
                    }}>
                      Guiding Questions
                    </label>
                    {(lens.questions || ['', '']).map((question, idx) => (
                      <input
                        key={idx}
                        value={question}
                        onChange={e => handleUpdateLens(lens.id, 'question', e.target.value, idx)}
                        placeholder={`Question ${idx + 1}...`}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: '#0F1724',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          color: '#E6EEF8',
                          fontSize: '13px',
                          marginBottom: idx === 0 ? '6px' : '0',
                          boxSizing: 'border-box'
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
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
              padding: '10px',
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
    </div>
  );
}