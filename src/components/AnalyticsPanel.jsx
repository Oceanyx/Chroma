// src/components/AnalyticsPanel.jsx
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { domainColors, patternTypes, agencyStates } from '../seedData';

export default function AnalyticsPanel({ nodes, lenses, onClose }) {
  const contentNodes = nodes.filter(n => n.type === 'content');
  
  const domainCounts = {
    private: contentNodes.filter(n => n.data.domainIds?.includes('private')).length,
    public: contentNodes.filter(n => n.data.domainIds?.includes('public')).length,
    abstract: contentNodes.filter(n => n.data.domainIds?.includes('abstract')).length
  };

  const lensCounts = lenses.map(lens => ({
    ...lens,
    count: contentNodes.filter(n => n.data.lensIds?.includes(lens.id)).length
  }));

  const patternTypeCounts = patternTypes.map(type => ({
    ...type,
    count: contentNodes.filter(n => n.data.patternType === type.id).length
  }));

  const agencyCounts = agencyStates.map(state => ({
    ...state,
    count: contentNodes.filter(n => n.data.agencyOrientation === state.id).length
  }));

  // Collect all meta tags
  const allMetaTags = {};
  contentNodes.forEach(node => {
    (node.data.metaTags || []).forEach(tag => {
      allMetaTags[tag] = (allMetaTags[tag] || 0) + 1;
    });
  });
  const topMetaTags = Object.entries(allMetaTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: '360px',
      background: '#0F1724',
      boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
      zIndex: 2000,
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
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={20} /> Analytics
        </h2>
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
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>Total Nodes</h3>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#6C63FF' }}>{contentNodes.length}</div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>By Domain</h3>
          {Object.entries(domainCounts).map(([domain, count]) => (
            <div key={domain} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '10px',
              background: '#1E293B',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ textTransform: 'capitalize' }}>{domain}</span>
              <span style={{ fontWeight: 600, color: domainColors[domain] }}>{count}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>By Lens</h3>
          {lensCounts.map(lens => (
            <div key={lens.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '10px',
              background: '#1E293B',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <span>{lens.name}</span>
              <span style={{ fontWeight: 600, color: lens.color }}>{lens.count}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>By Pattern Type</h3>
          {patternTypeCounts.map(type => (
            <div key={type.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '10px',
              background: '#1E293B',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ textTransform: 'capitalize' }}>{type.name}</span>
              <span style={{ fontWeight: 600 }}>{type.count}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>By Agency Orientation</h3>
          {agencyCounts.map(state => (
            <div key={state.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '10px',
              background: '#1E293B',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ textTransform: 'capitalize' }}>{state.name}</span>
              <span style={{ fontWeight: 600 }}>{state.count}</span>
            </div>
          ))}
        </div>

        {topMetaTags.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>Top Meta Tags</h3>
            {topMetaTags.map(([tag, count]) => (
              <div key={tag} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '10px',
                background: '#1E293B',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <span>{tag}</span>
                <span style={{ fontWeight: 600, color: '#A78BFA' }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}