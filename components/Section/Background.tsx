
import React from 'react';
import { Theme } from '../../utils/theme';

export const Background: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      backgroundColor: '#050505',
      backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      pointerEvents: 'none',
    }} />
  );
};
