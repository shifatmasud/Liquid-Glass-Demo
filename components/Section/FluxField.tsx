
import React from 'react';
import { Theme } from '../../utils/theme';

export const FluxField: React.FC = () => {
  const gridStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: Theme.Color.Base.Surface[1],
    backgroundSize: '40px 40px',
    backgroundImage: `
      linear-gradient(to right, ${Theme.Color.Base.Surface[2]} 1px, transparent 1px),
      linear-gradient(to bottom, ${Theme.Color.Base.Surface[2]} 1px, transparent 1px)
    `,
    // Subtle vignette to focus attention on the center
    maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 100%)',
    WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 100%)',
    pointerEvents: 'none',
    zIndex: 0
  };

  return <div style={gridStyle} />;
};
