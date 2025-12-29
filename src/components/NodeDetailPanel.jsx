// src/components/NodeDetailPanel.jsx
import React, { useState, useMemo } from 'react';
import { domainColors, patternTypes, agencyStates, predefinedMetaTags, metaPatternHints, metaPatternLibrary, metaPatternCategories, modes, domainQuestionBanks, getMetaTagWithFraming, strengthMetaTags, connectionTypes } from '../seedData';
import { Plus, Trash2, HelpCircle, MessageSquare, Eye, Lightbulb, RefreshCw, Clock } from 'lucide-react';

// Add custom scrollbar styles for NodeDetailPanel
if (typeof document !== 'undefined' && !document.getElementById('node-panel-scrollbar-style')) {
  const style = document.createElement('style');
  style.id = 'node-panel-scrollbar-style';
  style.textContent = `
    [data-node-panel-scrollable]::-webkit-scrollbar {
      width: 6px;
    }
    [data-node-panel-scrollable]::-webkit-scrollbar-track {
      background: transparent;
      margin: 12px 0;
    }
    [data-node-panel-scrollable]::-webkit-scrollbar-thumb {
      background: rgba(108, 99, 255, 0.3);
      border-radius: 10px;
    }
    [data-node-panel-scrollable]::-webkit-scrollbar-thumb:hover {
      background: rgba(108, 99, 255, 0.6);
    }
  `;
  document.head.appendChild(style);
}

export default function NodeDetailPanel({
  node, onClose, onUpdate, onDelete, lenses, edges, nodes, onDeleteEdge, onCreateEdge, onUpdateEdge,
  recentMetaTags = [], onAddRecentMetaTag = () => {}
})

{
  const [formData, setFormData] = useState({
    title: node.data.title || '',
    perceivedPattern: node.data.perceivedPattern || '',
    interpretation: node.data.interpretation || '',
    activeQuestions: node.data.activeQuestions || '',
    feltSense: node.data.feltSense || '',
    agencyOrientation: node.data.agencyOrientation || 'curious',
    agencyIntensity: node.data.agencyIntensity || 5,
    customAgency: node.data.customAgency || '',
    metaTags: node.data.metaTags || [],
    patternType: node.data.patternType || 'trigger',
    beforeState: node.data.beforeState || '',
    afterState: node.data.afterState || '',
    refinesNodeId: node.data.refinesNodeId || null,
    mode: node.data.mode || 'field-first',
    notes: node.data.notes || '',
    domainIds: node.data.domainIds || [],
    lensIds: node.data.lensIds || []
  });

  const [showLensGuidance, setShowLensGuidance] = useState(false);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [newConnection, setNewConnection] = useState({ targetId: '', label: '', type: 'influences', explanation: '', metaPatternId: '' });
  const [customTagInput, setCustomTagInput] = useState('');
  const [guidanceLevel, setGuidanceLevel] = useState('quick');
  const [showGuidance, setShowGuidance] = useState(false);
  const [selectedDiagnosticCategory, setSelectedDiagnosticCategory] = useState(null);
  const [tagFramingView, setTagFramingView] = useState('strength');
  const [localSuggestedTags, setLocalSuggestedTags] = useState(() => predefinedMetaTags.slice(0, 20));
  const [editingEdgeId, setEditingEdgeId] = useState(null);

  const feltPresets = ['Tightness in chest', 'Floating / dissociated', 'Warm clarity', 'Fog / confusion', 'Restless energy', 'Calm / grounded'];

  const availableDomains = [
    { id: 'private', name: 'Private' },
    { id: 'public', name: 'Public' },
    { id: 'abstract', name: 'Abstract' }
  ];

  const toggleLens = (lensId) => setFormData(prev => ({ ...prev, lensIds: prev.lensIds.includes(lensId) ? prev.lensIds.filter(id => id !== lensId) : [...prev.lensIds, lensId] }));

const toggleDomain = (domainId) => setFormData(prev => {
  const has = prev.domainIds.includes(domainId);
  if (has) return { ...prev, domainIds: [] }; // Unselect if clicking the same one
  return { ...prev, domainIds: [domainId] }; // Replace with new selection
});

  const addMetaTag = (tag) => {
    if (!formData.metaTags.includes(tag)) {
      setFormData(prev => ({ ...prev, metaTags: [...prev.metaTags, tag] }));
      onAddRecentMetaTag(tag);
    }
  };
  const removeMetaTag = (tag) => setFormData(prev => ({ ...prev, metaTags: prev.metaTags.filter(t => t !== tag) }));

  const reframeTag = (oldTag, newTag) => {
    setFormData(prev => ({ ...prev, metaTags: prev.metaTags.map(t => t === oldTag ? newTag : t) }));
  };

  const addCustomTag = (addToSuggestions = false) => {
    const t = customTagInput.trim();
    if (!t) return;
    if (!formData.metaTags.includes(t)) addMetaTag(t);
    if (addToSuggestions && !localSuggestedTags.includes(t)) {
      setLocalSuggestedTags(prev => [t, ...prev]);
      onAddRecentMetaTag(t);
    }
    setCustomTagInput('');
  };

  const handleSave = () => {
    if (formData.lensIds.length === 0) { alert('Please select at least one lens'); return; }
    if (formData.domainIds.length === 0) { alert('Please select at least one domain'); return; }
    onUpdate(node.id, formData); onClose();
  };

  const handleDelete = () => { if (window.confirm('Delete this node?')) { onDelete(node.id); onClose(); } };
  const nodeEdges = edges.filter(e => e.source === node.id || e.target === node.id);
  const contentNodes = nodes.filter(n => n.type === 'content' && n.id !== node.id);

  const handleCreateConnection = () => {
    if (newConnection.targetId) {
      onCreateEdge({ 
        id: `e-${Date.now()}`, 
        source: node.id, 
        target: newConnection.targetId, 
        label: newConnection.label || connectionTypes.find(c => c.id === newConnection.type)?.name || 'Connected to', 
        type: newConnection.type || 'influences',
        explanation: newConnection.explanation || '',
        metaPatternId: newConnection.type === 'meta-pattern' ? newConnection.metaPatternId : null
      });
      setNewConnection({ targetId: '', label: '', type: 'influences', explanation: '', metaPatternId: '' }); 
      setShowAddConnection(false);
    }
  };

const handleUpdateEdge = async (edgeId, updates) => {
  if (onUpdateEdge) {
    await onUpdateEdge(edgeId, updates);
    // Give it a moment for the parent to update
    setTimeout(() => setEditingEdgeId(null), 100);
  }
};

  const HelpTooltip = ({ children }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <span style={{ color: '#64748B', cursor: 'help', padding: '0 4px', marginLeft: '4px', display: 'inline-flex', alignItems: 'center' }}>
          <HelpCircle size={14} />
        </span>
        {isHovered && (
          <div style={{ position: 'absolute', top: '24px', left: '0', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: '#CBD5E1', width: '260px', zIndex: 1000, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  const currentAgency = agencyStates.find(a => a.id === formData.agencyOrientation);

  const getGuidanceQuestions = () => {
    const domains = formData.domainIds.length > 0 ? formData.domainIds : ['private'];
    const questions = { quick: [], deep: [], experiments: [] };
    domains.forEach(d => {
      if (domainQuestionBanks[d]) {
        questions.quick.push(...domainQuestionBanks[d].quick);
        questions.deep.push(...domainQuestionBanks[d].deep);
        questions.experiments.push(...domainQuestionBanks[d].experiments);
      }
    });
    return questions;
  };

  const guidanceQuestions = getGuidanceQuestions();

  const computeSuggested = () => {
    const collected = [];
    const pushUnique = (t) => { if (!collected.includes(t) && !formData.metaTags.includes(t)) collected.push(t); };
    if (Array.isArray(recentMetaTags)) recentMetaTags.forEach(t => pushUnique(t));
    localSuggestedTags.forEach(t => pushUnique(t));
    const haystack = `${formData.feltSense || ''} ${formData.interpretation || ''} ${formData.perceivedPattern || ''} ${formData.activeQuestions || ''} ${formData.patternType || ''} ${formData.agencyOrientation || ''} ${formData.mode || ''} ${formData.domainIds?.join(' ') || ''}`.toLowerCase();
    (metaPatternHints || []).forEach(h => {
      const hit = (h.keywords || []).some(kw => haystack.includes(kw.toLowerCase()));
      if (hit) pushUnique(h.tag);
    });
    predefinedMetaTags.slice(0, 12).forEach(t => pushUnique(t));
    return collected.slice(0, 12);
  };

  const suggestedMetaTags = useMemo(computeSuggested, [
    formData.feltSense, formData.interpretation, formData.perceivedPattern, formData.activeQuestions,
    formData.patternType, formData.agencyOrientation, formData.mode,
    JSON.stringify(formData.domainIds || []), JSON.stringify(recentMetaTags), JSON.stringify(localSuggestedTags)
  ]);

  // Styles - increased font sizes
  const sectionStyle = { marginBottom: '18px', padding: '16px', borderRadius: '10px' };
  const observationBg = { ...sectionStyle, background: 'linear-gradient(135deg, #0B1220 0%, #0D1528 100%)', border: '1px solid rgba(79, 159, 255, 0.15)' };
  const interpretationBg = { ...sectionStyle, background: 'linear-gradient(135deg, #12101E 0%, #1A1428 100%)', border: '1px solid rgba(168, 139, 250, 0.15)' };
  const inputStyle = { width: '100%', padding: '10px 12px', background: '#0A0F1A', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: '6px', color: '#E6EEF8', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' };
  const inputFocusProps = { onFocus: (e) => { e.target.style.borderColor = '#6C63FF'; e.target.style.boxShadow = '0 0 0 2px rgba(108, 99, 255, 0.2)'; }, onBlur: (e) => { e.target.style.borderColor = 'rgba(148, 163, 184, 0.25)'; e.target.style.boxShadow = 'none'; } };
  const labelStyle = { display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px', color: '#94A3B8', fontWeight: 500 };
  const sectionTitleStyle = { fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' };

  const getConnectionTypeStyle = (type) => {
    const ct = connectionTypes.find(c => c.id === type);
    return ct ? { color: ct.color, borderColor: ct.color } : { color: '#94A3B8', borderColor: '#94A3B8' };
  };

  return (
    <div style={{ position: 'fixed', right: 0, top: '80px', bottom: 0, width: '500px', background: '#0F1724', boxShadow: '-4px 0 24px rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', flexDirection: 'column', color: '#E6EEF8' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Node title..." style={{ fontSize: '18px', fontWeight: 600, background: 'transparent', border: 'none', color: '#E6EEF8', outline: 'none', minWidth: '140px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setShowGuidance(prev => !prev)} style={{ background: showGuidance ? '#6C63FF' : 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: showGuidance ? '#fff' : '#94A3B8', padding: '6px 10px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={14} /> Domain Guide
          </button>
          <button onClick={() => setShowLensGuidance(prev => !prev)} style={{ background: showLensGuidance ? '#EC4899' : 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: showLensGuidance ? '#fff' : '#94A3B8', padding: '6px 10px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={14} /> Lens Guide
          </button>
          <button onClick={handleDelete} style={{ background: 'transparent', border: '1px solid #EF4444', borderRadius: '6px', color: '#EF4444', cursor: 'pointer', padding: '6px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trash2 size={14} />
          </button>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '24px', cursor: 'pointer', padding: '4px 8px', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
      </div>

      <div data-node-panel-scrollable="true" style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
        {/* Domain Guidance Panel */}
        {showGuidance && (
          <div style={{ marginBottom: '18px', padding: '14px', background: '#0B1220', borderRadius: '10px', border: '1px solid rgba(79, 159, 255, 0.2)'}}>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} color="#4D9FFF" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#4D9FFF' }}>Domain Questions</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {['quick', 'deep', 'experiments'].map(level => (
                <button key={level} onClick={() => setGuidanceLevel(level)} style={{ padding: '6px 12px', background: guidanceLevel === level ? '#4D9FFF' : '#1E293B', border: `1px solid ${guidanceLevel === level ? '#4D9FFF' : 'rgba(148, 163, 184, 0.2)'}`, borderRadius: '6px', color: '#E6EEF8', cursor: 'pointer', fontSize: '13px', textTransform: 'capitalize', transition: 'all 0.15s' }}>{level}</button>
              ))}
            </div>
            {formData.domainIds.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                Select a domain to see guiding questions
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.domainIds.map(domainId => {
                  const domainQuestions = domainQuestionBanks[domainId];
                  if (!domainQuestions) return null;
                  
                  return (
                    <div key={domainId} style={{
                      padding: '10px',
                      background: 'rgba(30, 41, 59, 0.4)',
                      borderRadius: '6px',
                      border: `1px solid ${domainColors[domainId]}30`
                    }}>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: domainColors[domainId],
                        marginBottom: '6px',
                        textTransform: 'capitalize'
                      }}>
                        {domainId}
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#CBD5E1', fontSize: '12px', lineHeight: '1.6' }}>
                        {domainQuestions[guidanceLevel]?.slice(0, 5).map((q, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Lens Guidance Panel */}
        {showLensGuidance && (
          <div style={{ marginBottom: '18px', padding: '14px', background: '#12101E', borderRadius: '10px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={16} color="#EC4899" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#EC4899' }}>Active Lens Questions</span>
            </div>
            {formData.lensIds.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                Select a lens to see guiding questions
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.lensIds.map(lensId => {
                  const lens = lenses.find(l => l.id === lensId);
                  if (!lens || !lens.questions) return null;
                  
                  return (
                    <div key={lensId} style={{
                      padding: '10px',
                      background: 'rgba(30, 41, 59, 0.4)',
                      borderRadius: '6px',
                      border: `1px solid ${lens.color}30`
                    }}>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: lens.color,
                        marginBottom: '6px',
                        textTransform: 'capitalize'
                      }}>
                        {lens.name}
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#CBD5E1', fontSize: '12px', lineHeight: '1.6' }}>
                        {lens.questions.map((q, i) => q && (
                          <li key={i} style={{ marginBottom: '4px' }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}  
        {/* Configuration Section - At Top */}
        <div style={{ ...sectionStyle, background: '#0B1220', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '18px' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 600, color: '#E6EEF8' }}>Configuration</h3>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Domains</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {availableDomains.map(domain => (
                <button key={domain.id} onClick={() => toggleDomain(domain.id)} style={{ padding: '8px 14px', background: formData.domainIds.includes(domain.id) ? domainColors[domain.id] : '#1E293B', border: `1px solid ${formData.domainIds.includes(domain.id) ? domainColors[domain.id] : 'rgba(148, 163, 184, 0.2)'}`, borderRadius: '6px', color: formData.domainIds.includes(domain.id) ? '#000' : '#E6EEF8', cursor: 'pointer', fontSize: '13px', fontWeight: formData.domainIds.includes(domain.id) ? 600 : 400, transition: 'all 0.15s' }}>{domain.name}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Lenses {formData.lensIds.length === 0 && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {lenses.map(lens => (
                <button key={lens.id} onClick={() => toggleLens(lens.id)} style={{ padding: '8px 14px', background: formData.lensIds.includes(lens.id) ? lens.color : '#1E293B', border: `1px solid ${formData.lensIds.includes(lens.id) ? lens.color : 'rgba(148, 163, 184, 0.2)'}`, borderRadius: '6px', color: '#E6EEF8', cursor: 'pointer', fontSize: '13px', fontWeight: formData.lensIds.includes(lens.id) ? 600 : 400, transition: 'all 0.15s' }}>{lens.name}</button>
              ))}
            </div>
          </div>
        </div>
        
        {/* OBSERVATION SECTION */}
        <div style={observationBg}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Eye size={18} color="#4D9FFF" />
            <span style={{ ...sectionTitleStyle, color: '#4D9FFF' }}>What I Notice</span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Observation<HelpTooltip>What did you notice? What actually happened?</HelpTooltip></label>
            <textarea value={formData.perceivedPattern} onChange={e => setFormData(prev => ({ ...prev, perceivedPattern: e.target.value }))} rows={3} placeholder="What I observe happening..." style={inputStyle} {...inputFocusProps} />
          </div>
          <div>
            <label style={labelStyle}>Felt Sense<HelpTooltip>Body sensations, energy, temperature, tension?</HelpTooltip></label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {feltPresets.map(p => (
                <button key={p} onClick={() => setFormData(prev => ({ ...prev, feltSense: p }))} style={{ padding: '6px 10px', background: formData.feltSense === p ? '#6C63FF' : '#1E293B', border: `1px solid ${formData.feltSense === p ? '#6C63FF' : 'rgba(148, 163, 184, 0.2)'}`, borderRadius: '6px', color: '#E6EEF8', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s' }}>{p}</button>
              ))}
            </div>
            <textarea value={formData.feltSense} onChange={e => setFormData(prev => ({ ...prev, feltSense: e.target.value }))} rows={2} placeholder="Physical sensations..." style={inputStyle} {...inputFocusProps} />
          </div>
        </div>

        {/* INTERPRETATION SECTION */}
        <div style={interpretationBg}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Lightbulb size={18} color="#A78BFA" />
            <span style={{ ...sectionTitleStyle, color: '#A78BFA' }}>How I'm Making Sense</span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Interpretation<HelpTooltip>How are you making meaning of this?</HelpTooltip></label>
            <textarea value={formData.interpretation} onChange={e => setFormData(prev => ({ ...prev, interpretation: e.target.value }))} rows={3} placeholder="The story I'm telling myself..." style={inputStyle} {...inputFocusProps} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Active Questions<HelpTooltip>What remains unclear or unresolved?</HelpTooltip></label>
            <textarea value={formData.activeQuestions} onChange={e => setFormData(prev => ({ ...prev, activeQuestions: e.target.value }))} rows={2} placeholder="What I'm still wondering..." style={inputStyle} {...inputFocusProps} />
          </div>

          {/* Meta Tags */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Meta Tags<HelpTooltip>Recurring patterns this belongs to</HelpTooltip></label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['strength', 'diagnostic'].map(view => (
                  <button key={view} onClick={() => { setTagFramingView(view); setSelectedDiagnosticCategory(null); }} style={{ padding: '4px 8px', background: tagFramingView === view ? '#6C63FF' : '#1E293B', border: `1px solid ${tagFramingView === view ? '#6C63FF' : 'rgba(148, 163, 184, 0.15)'}`, borderRadius: '4px', color: tagFramingView === view ? '#fff' : '#94A3B8', cursor: 'pointer', fontSize: '11px', textTransform: 'capitalize', transition: 'all 0.15s' }}>{view}</button>
                ))}
              </div>
            </div>

            {formData.metaTags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {formData.metaTags.map(tag => {
                  const info = getMetaTagWithFraming(tag);
                  return (
                    <div key={tag} style={{ padding: '5px 10px', background: info.framing === 'strength' ? '#10B981' : '#6C63FF', borderRadius: '4px', fontSize: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {tag}
                      {info.alt && (
                        <button onClick={() => reframeTag(tag, info.alt)} title={`Reframe as: ${info.alt}`} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer', padding: '2px 4px', fontSize: '10px', display: 'flex', alignItems: 'center' }}>
                          <RefreshCw size={10} />
                        </button>
                      )}
                      <button onClick={() => removeMetaTag(tag)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0', fontSize: '14px', lineHeight: '1' }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <input value={customTagInput} onChange={e => setCustomTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addCustomTag(true)} placeholder="+ Custom tag..." style={{ ...inputStyle, flex: 1, resize: 'none' }} {...inputFocusProps} />
              <button onClick={() => addCustomTag(true)} style={{ padding: '8px 14px', background: '#10B981', border: '1px solid #10B981', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.15s' }}>+</button>
            </div>

            {/* Category selection for diagnostic view */}
            {tagFramingView === 'diagnostic' && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {metaPatternCategories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedDiagnosticCategory(selectedDiagnosticCategory === cat.id ? null : cat.id)} title={cat.description} style={{ padding: '6px 12px', background: selectedDiagnosticCategory === cat.id ? '#6C63FF' : '#1E293B', border: `1px solid ${selectedDiagnosticCategory === cat.id ? '#6C63FF' : 'rgba(148, 163, 184, 0.15)'}`, borderRadius: '6px', color: selectedDiagnosticCategory === cat.id ? '#fff' : '#C7D2FE', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📁 {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show tags based on view and selection */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {tagFramingView === 'strength' ? (
                strengthMetaTags.slice(0, 10).filter(t => !formData.metaTags.includes(t)).map(tag => (
                  <button key={tag} onClick={() => addMetaTag(tag)} style={{ padding: '6px 10px', background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '5px', color: '#C7D2FE', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s' }}>{tag}</button>
                ))
              ) : selectedDiagnosticCategory ? (
                metaPatternLibrary[selectedDiagnosticCategory]?.map(item => item.diagnostic).filter(t => !formData.metaTags.includes(t)).map(tag => (
                  <button key={tag} onClick={() => addMetaTag(tag)} style={{ padding: '6px 10px', background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '5px', color: '#C7D2FE', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    + {tag}
                  </button>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', padding: '8px' }}>Select a category above to see diagnostic patterns</div>
              )}
            </div>
          </div>

        {/* Agency Orientation */}
        <div style={{ ...sectionStyle, background: '#0B1220', border: '1px solid rgba(255,255,255,0.04)' }}>
          <label style={{ ...labelStyle, marginBottom: '12px' }}>Agency Orientation<HelpTooltip>How are you relating to this pattern?</HelpTooltip></label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {agencyStates.map(state => (
              <button key={state.id} onClick={() => setFormData(prev => ({ ...prev, agencyOrientation: state.id }))} title={state.description} style={{ padding: '7px 12px', background: formData.agencyOrientation === state.id ? '#6C63FF' : '#1E293B', border: `1px solid ${formData.agencyOrientation === state.id ? '#6C63FF' : 'rgba(148, 163, 184, 0.2)'}`, borderRadius: '6px', color: '#E6EEF8', cursor: 'pointer', fontSize: '12px', fontWeight: formData.agencyOrientation === state.id ? 600 : 400, transition: 'all 0.15s' }}>{state.name}</button>
            ))}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ ...labelStyle, fontSize: '13px' }}>Custom Agency Label (optional)</label>
            <input value={formData.customAgency} onChange={e => setFormData(prev => ({ ...prev, customAgency: e.target.value }))} placeholder="e.g., Strategic boundary setting..." style={{ ...inputStyle, resize: 'none' }} {...inputFocusProps} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
              <span>Passive</span>
              <span>Intensity: {formData.agencyIntensity}</span>
              <span>Active</span>
            </div>
            <input type="range" min="0" max="10" value={formData.agencyIntensity} onChange={e => setFormData(prev => ({ ...prev, agencyIntensity: parseInt(e.target.value) }))} style={{ width: '100%', accentColor: '#6C63FF' }} />
          </div>
          {currentAgency && <div style={{ marginTop: '10px', fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>{currentAgency.description}</div>}
        </div>

        {/* Temporal Pattern */}
        <div style={{ ...sectionStyle, background: '#0B1220', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Clock size={18} color="#F59E0B" />
            <span style={{ ...sectionTitleStyle, color: '#F59E0B' }}>Temporal Pattern</span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Pattern Type</label>
            <select value={formData.patternType} onChange={e => setFormData(prev => ({ ...prev, patternType: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} {...inputFocusProps}>
              {patternTypes.map(type => <option key={type.id} value={type.id}>{type.name} — {type.description}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Before State</label>
              <input value={formData.beforeState} onChange={e => setFormData(prev => ({ ...prev, beforeState: e.target.value }))} placeholder="State before..." style={inputStyle} {...inputFocusProps} />
            </div>
            <div>
              <label style={labelStyle}>After State</label>
              <input value={formData.afterState} onChange={e => setFormData(prev => ({ ...prev, afterState: e.target.value }))} placeholder="State after..." style={inputStyle} {...inputFocusProps} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Notes</label>
          <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Additional observations..." style={inputStyle} {...inputFocusProps} />
        </div>

        {/* Connections */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 500 }}>Connections ({nodeEdges.length})</label>
            <button onClick={() => setShowAddConnection(!showAddConnection)} style={{ padding: '6px 12px', background: '#6C63FF', border: '1px solid #6C63FF', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, transition: 'all 0.15s' }}><Plus size={14} /> Add</button>
          </div>
          
          {showAddConnection && (
            <div style={{ padding: '14px', background: '#0A0F1A', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ ...labelStyle, fontSize: '13px' }}>Target Node</label>
                <select value={newConnection.targetId} onChange={e => setNewConnection(prev => ({ ...prev, targetId: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} {...inputFocusProps}>
                  <option value="">Select node...</option>
                  {contentNodes.map(n => <option key={n.id} value={n.id}>{n.data.title || 'Untitled'}</option>)}
                </select>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ ...labelStyle, fontSize: '13px' }}>Connection Type</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {connectionTypes.map(ct => (
                    <button key={ct.id} onClick={() => setNewConnection(prev => ({ ...prev, type: ct.id }))} title={ct.description} style={{ padding: '6px 10px', background: newConnection.type === ct.id ? ct.color : '#1E293B', border: `1px solid ${newConnection.type === ct.id ? ct.color : 'rgba(148, 163, 184, 0.2)'}`, borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s' }}>{ct.name}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ ...labelStyle, fontSize: '13px' }}>Label (optional)</label>
                <input value={newConnection.label} onChange={e => setNewConnection(prev => ({ ...prev, label: e.target.value }))} placeholder="Custom label..." style={{ ...inputStyle, resize: 'none' }} {...inputFocusProps} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ ...labelStyle, fontSize: '13px' }}>Explanation</label>
                <textarea value={newConnection.explanation} onChange={e => setNewConnection(prev => ({ ...prev, explanation: e.target.value }))} placeholder="Why are these connected?" rows={2} style={inputStyle} {...inputFocusProps} />
              </div>

              {newConnection.type === 'meta-pattern' && (
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ ...labelStyle, fontSize: '13px' }}>Shared Meta Pattern</label>
                  <select value={newConnection.metaPatternId} onChange={e => setNewConnection(prev => ({ ...prev, metaPatternId: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} {...inputFocusProps}>
                    <option value="">Select pattern...</option>
                    {predefinedMetaTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowAddConnection(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '6px', color: '#94A3B8', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.15s' }}>Cancel</button>
                <button onClick={handleCreateConnection} disabled={!newConnection.targetId} style={{ flex: 1, padding: '10px', background: newConnection.targetId ? '#10B981' : '#1E293B', border: '1px solid', borderColor: newConnection.targetId ? '#10B981' : 'rgba(148, 163, 184, 0.2)', borderRadius: '6px', color: '#fff', cursor: newConnection.targetId ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 500, transition: 'all 0.15s' }}>Create Connection</button>
              </div>
            </div>
          )}

          {/* Existing connections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nodeEdges.map(edge => {
              const isSource = edge.source === node.id;
              const otherId = isSource ? edge.target : edge.source;
              const otherNode = nodes.find(n => n.id === otherId);
              const connType = connectionTypes.find(c => c.id === edge.type) || connectionTypes[0];
              const isEditing = editingEdgeId === edge.id;

              return (
                <div key={edge.id} style={{ padding: '12px', background: '#0A0F1A', borderRadius: '8px', border: `1px solid ${connType.color}30` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isEditing ? '10px' : '0' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', color: '#E6EEF8', fontWeight: 500 }}>{isSource ? '→' : '←'} {otherNode?.data.title || 'Unknown'}</span>
                        <span style={{ padding: '2px 8px', background: `${connType.color}20`, border: `1px solid ${connType.color}50`, borderRadius: '4px', fontSize: '11px', color: connType.color }}>{connType.name}</span>
                      </div>
                      {edge.label && edge.label !== connType.name && <div style={{ fontSize: '12px', color: '#94A3B8' }}>{edge.label}</div>}
                      {edge.explanation && <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontStyle: 'italic' }}>{edge.explanation}</div>}
                      {edge.metaPatternId && <div style={{ fontSize: '11px', color: '#A78BFA', marginTop: '4px' }}>Pattern: {edge.metaPatternId}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setEditingEdgeId(isEditing ? null : edge.id)} style={{ padding: '5px 8px', background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '4px', color: '#94A3B8', cursor: 'pointer', fontSize: '11px' }}>{isEditing ? 'Done' : 'Edit'}</button>
                      <button onClick={() => onDeleteEdge(edge.id)} style={{ padding: '5px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {isEditing && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px', display: 'block' }}>Type</label>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {connectionTypes.map(ct => (
                            <button key={ct.id} onClick={() => handleUpdateEdge(edge.id, { type: ct.id })} style={{ padding: '4px 8px', background: edge.type === ct.id ? ct.color : '#1E293B', border: `1px solid ${edge.type === ct.id ? ct.color : 'rgba(148, 163, 184, 0.15)'}`, borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '11px' }}>{ct.name}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

        {/* Timestamp */}
        <div style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          Created: {node.data.createdAt ? new Date(node.data.createdAt).toLocaleString() : 'Unknown'}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 18px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '12px' }}>
        <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
        <button onClick={handleSave} style={{ flex: 1, padding: '12px', background: '#6C63FF', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Save Changes</button>
      </div>
    </div>
  );
}