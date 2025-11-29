// src/components/Node.jsx
import React from 'react';
import { domainColors } from '../seedData';
import { Heart, MessageCircle, Brain, Sprout } from 'lucide-react';

export default function Node({ 
  node, 
  onDragStart, 
  onDragEnd, 
  onClick, 
  onHover, 
  onLeave, 
  isDragging, 
  isHovered, 
  activeLensIds, 
  blendColors, 
  lenses 
}) {
  const domainIcons = {
    private: Heart,
    public: MessageCircle,
    abstract: Brain
  };

  // Content nodes (seeds)
  const domainIds = node.data?.domainIds || [];
  const lensIds = node.data?.lensIds || [];
  
  // Check if seed is "expanded" (has domain data filled in)
  const hasContent = node.data?.domains?.private || 
                     node.data?.domains?.public || 
                     node.data?.domains?.abstract;
  
  // Visual state based on lens filtering
  const matches = lensIds.filter(l => activeLensIds.includes(l)).length;
  let background = blendColors(domainIds);
  let border = '1px solid rgba(255,255,255,0.15)';
  let boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  let seedIcon = hasContent ? '🌱' : '🌰'; // Sprout if expanded, seed if not

  if (isHovered) {
    border = '2px solid #FFFFFF';
    boxShadow = '0 8px 24px rgba(255,255,255,0.3)';
  } else if (matches > 0 && activeLensIds.length > 0) {
    const activeLens = lenses.find(l => activeLensIds.includes(l.id) && lensIds.includes(l.id));
    border = activeLens ? `2px solid ${activeLens.color}` : '2px solid #6C63FF';
    boxShadow = `0 6px 20px ${activeLens?.color}40`;
  } else if (activeLensIds.length > 0 && matches === 0) {
    background = 'rgba(15,23,36,0.7)';
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node)}
      onDragEnd={(e) => onDragEnd(e, node)}
      onClick={(e) => onClick(node, e)}
      onMouseEnter={() => onHover && onHover(node)}
      onMouseLeave={() => onLeave && onLeave()}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        minWidth: '180px',
        maxWidth: '240px',
        background,
        border,
        boxShadow,
        borderRadius: '12px',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1000 : (isHovered ? 100 : 10),
        transition: 'all 0.2s ease',
        transform: isHovered ? 'scale(1.03)' : 'scale(1)',
        overflow: 'hidden'
      }}
    >
      {/* Seed indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        fontSize: '22px',
        opacity: hasContent ? 0.8 : 0.5,
        filter: hasContent ? 'none' : 'grayscale(30%)',
        transition: 'all 0.3s ease'
      }}>
        {seedIcon}
      </div>

      {/* Content */}
      <div style={{ 
        padding: '14px 12px 12px 12px',
        color: '#E6EEF8'
      }}>
        <div style={{ 
          fontWeight: 600, 
          marginBottom: '6px',
          fontSize: '14px',
          lineHeight: '1.4',
          paddingRight: '28px' // Space for seed icon
        }}>
          {node.data.title || 'Untitled Seed'}
        </div>
        
        {node.data.rawCapture && (
          <div style={{ 
            fontSize: '12px', 
            color: '#94A3B8',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {node.data.rawCapture}
          </div>
        )}

        {/* Domain indicators - show which domains have content */}
<div style={{
  display: 'flex',
  gap: '6px',
  marginTop: '8px',
  paddingTop: '8px',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  minHeight: '24px'
}}>
  {['private', 'public', 'abstract'].map(did => {
    const Icon = domainIcons[did];
    const hasThisDomain = node.data?.domains?.[did];
    
    if (!hasThisDomain) return null;
    
          return Icon ? (
            <div 
              key={did}
              style={{
                padding: '2px 6px',
                background: `${domainColors[did]}20`,
                border: `1px solid ${domainColors[did]}60`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Icon 
                size={12} 
                color={domainColors[did]}
              />
            </div>
          ) : null;
        })}
        {!node.data?.domains?.private && !node.data?.domains?.public && !node.data?.domains?.abstract && (
          <span style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>
            No reflection yet
          </span>
        )}
      </div>
      </div>
    </div>
  );
}