
import React from 'react';
import { motion } from 'framer-motion';
import { Theme } from '../../utils/theme';

interface DockItem {
  id: string;
  isOpen: boolean;
  title: string;
  icon: React.ReactNode;
}

interface DockProps {
  items: DockItem[];
  onToggle: (id: string) => void;
}

export const Dock: React.FC<DockProps> = ({ items, onToggle }) => {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      // Center at bottom initially
      initial={{ x: '-50%', y: 100, opacity: 0, left: '50%', bottom: Theme.Space.XL }}
      animate={{ x: '-50%', y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute', 
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: Theme.Space.M,
        padding: `${Theme.Space.S}px ${Theme.Space.M}px`,
        background: 'rgba(20, 20, 20, 0.6)',
        backdropFilter: `blur(${Theme.Effect.Blur.M})`,
        WebkitBackdropFilter: `blur(${Theme.Effect.Blur.M})`,
        borderRadius: Theme.Radius.Full,
        border: `1px solid ${Theme.Color.Effect.Glass.Border}`,
        boxShadow: Theme.Color.Effect.Glass.Shadow,
        cursor: 'grab',
      }}
      whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
    >
      {items.map((item) => (
        <DockIcon key={item.id} item={item} onClick={() => onToggle(item.id)} />
      ))}
    </motion.div>
  );
};

const DockIcon: React.FC<{ item: DockItem; onClick: () => void }> = ({ item, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.15, y: -4 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'relative',
        width: '44px',
        height: '44px',
        borderRadius: Theme.Radius.M,
        border: 'none',
        background: item.isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: item.isOpen ? Theme.Color.Base.Content[1] : Theme.Color.Base.Content[2],
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {item.icon}
      
      {/* Active Dot Indicator */}
      {item.isOpen && (
        <motion.div
          layoutId={`dock-dot-${item.id}`}
          style={{
            position: 'absolute',
            bottom: '-4px',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: Theme.Color.Base.Content[1],
            boxShadow: '0 0 4px rgba(255,255,255,0.5)',
          }}
        />
      )}
    </motion.button>
  );
};
