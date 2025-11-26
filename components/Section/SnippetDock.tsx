
import React from 'react';
import { Theme } from '../../utils/theme';
import { motion } from 'framer-motion';

export const SnippetDock: React.FC = () => {
  const icons = [
    "https://assets.codepen.io/605876/finder.png",
    "https://assets.codepen.io/605876/launch-control.png",
    "https://assets.codepen.io/605876/safari.png",
    "https://assets.codepen.io/605876/calendar.png"
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      background: 'rgba(200, 200, 200, 0.1)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
    }}>
      {icons.map((src, i) => (
        <motion.img
          key={i}
          src={src}
          alt="Dock Icon"
          style={{
            width: '64px',
            height: '64px',
            objectFit: 'contain',
            borderRadius: '14px',
            cursor: 'pointer',
          }}
          whileHover={{ 
            scale: 1.2, 
            translateY: -10,
            margin: '0 10px'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      ))}
    </div>
  );
};
