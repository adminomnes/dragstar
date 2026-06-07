import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Card({ children, className = '', style }: CardProps) {
  const baseStyle: React.CSSProperties = {
    background: 'var(--card-bg, #1a1a24)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    ...style,
  };
  return (
    <div className={`card ${className}`} style={baseStyle}>
      {children}
    </div>
  );
}
