import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Theme } from '../../utils/theme';

interface GlassProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  variant?: 'base' | 'interactive';
}

export const Glass: React.FC<GlassProps> = ({ children, variant = 'base', style, ...props }) => {
  const isInteractive = variant === 'interactive';

  return (
    <motion.div
      style={{
        // FIX: Corrected path for glass surface color
        background: Theme.Color.Effect.Glass.Surface,
        backdropFilter: `blur(${Theme.Effect.Blur.M})`,
        WebkitBackdropFilter: `blur(${Theme.Effect.Blur.M})`,
        // FIX: Corrected path for glass border color
        border: `1px solid ${Theme.Color.Effect.Glass.Border}`,
        borderRadius: '24px',
        // FIX: Corrected path for primary content color
        color: Theme.Color.Base.Content[1],
        // FIX: Corrected path from object to specific shadow value
        boxShadow: Theme.Effect.Shadow.Drop[2],
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
      initial={false}
      whileHover={isInteractive ? { 
        // FIX: Corrected path for hover background color
        backgroundColor: Theme.Color.Effect.Glass.SurfaceHighlight,
        // FIX: Corrected path for highlight border color (Focus -> Blue/Info)
        borderColor: Theme.Color.Fixed.Info,
        scale: 1.01,
      } : undefined}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {/* Performance Optimization: Noise overlay removed */}
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
};