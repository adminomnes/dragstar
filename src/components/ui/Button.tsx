import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, ...rest }: ButtonProps) {
  const baseStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: 600 as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  };

  const styles = {
    primary: {
      background: '#D4AF37',
      color: '#000',
    },
    secondary: {
      background: 'transparent',
      color: '#9ca3af',
      border: '1px solid rgba(255,255,255,0.1)',
    },
  };

  return (
    <button style={{ ...baseStyle, ...styles[variant] }} {...rest}>
      {children}
    </button>
  );
}
