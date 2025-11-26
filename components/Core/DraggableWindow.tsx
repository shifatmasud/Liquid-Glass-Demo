import React from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Theme } from '../../utils/theme';

interface DraggableWindowProps {
  id: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
  width?: string;
  height?: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
}

export const DraggableWindow: React.FC<DraggableWindowProps> = React.memo(({
  id,
  title,
  isOpen,
  onClose,
  onFocus,
  zIndex,
  width = '300px',
  height = 'auto',
  children,
}) => {
  const dragControls = useDragControls();

  const startDrag = (e: React.PointerEvent) => {
    onFocus();
    dragControls.start(e);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          drag
          dragListener={false} // Only drag from header
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0} // Conflictless rigid drag
          initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-40%', left: '50%', top: '50%' }}
          animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%', filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'absolute',
            width,
            height,
            zIndex,
            backgroundColor: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: `blur(${Theme.Effect.Blur.L})`,
            WebkitBackdropFilter: `blur(${Theme.Effect.Blur.L})`,
            borderRadius: Theme.Radius.M,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px -16px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            touchAction: 'none', // Crucial for mobile drag
          }}
          onPointerDown={onFocus}
        >
          {/* Header - Drag Handle */}
          <div
            onPointerDown={startDrag}
            style={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `0 ${Theme.Space.M}px`,
              borderBottom: `1px solid rgba(255,255,255,0.05)`,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0))',
              cursor: 'grab',
              userSelect: 'none',
              flexShrink: 0,
              touchAction: 'none',
            }}
          >
            {/* Title (Left) */}
            <span style={{ 
              ...Theme.Type.Readable.Label.S, 
              color: Theme.Color.Base.Content[2],
              letterSpacing: '0.05em',
              pointerEvents: 'none',
            }}>
              {title.toUpperCase()}
            </span>

            {/* Close Button (Right - Single Red Circle) */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking close
              aria-label="Close"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: '#FF4433', // Vivid System Red
                boxShadow: '0 0 8px rgba(255, 68, 51, 0.4)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = '#FF6655';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#FF4433';
              }}
            />
          </div>

          {/* Content Area */}
          <div 
             onPointerDown={(e) => e.stopPropagation()} // Content clicks focus (via bubble) but don't start drag
             style={{ 
                padding: Theme.Space.M, 
                overflowY: 'auto', 
                flex: 1, 
                maxHeight: '60vh',
                // Scrollbar hiding for cleaner UI
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
             }}
          >
            {children}
            <style>{`
              div::-webkit-scrollbar { display: none; }
            `}</style>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});