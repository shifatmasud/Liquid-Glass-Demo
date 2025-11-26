
import React from 'react';
import { Theme } from '../../utils/theme';
import { motion } from 'framer-motion';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: Theme.Space.XS }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ ...Theme.Type.Readable.Label.S, color: Theme.Color.Base.Content[2] }}>{label}</span>
        <span style={{ ...Theme.Type.Readable.Label.XS, fontFamily: 'monospace', color: Theme.Color.Base.Content[1] }}>{value}</span>
      </div>
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '4px',
            appearance: 'none',
            background: Theme.Color.Base.Surface[3],
            borderRadius: Theme.Radius.Full,
            outline: 'none',
            cursor: 'ew-resize',
          }}
          className="range-input"
        />
        <style>{`
          .range-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px; height: 12px;
            background: ${Theme.Color.Base.Content[1]};
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.1s;
            box-shadow: 0 0 0 2px ${Theme.Color.Base.Surface[2]};
          }
          .range-input::-webkit-slider-thumb:hover { transform: scale(1.2); }
        `}</style>
      </div>
    </div>
  );
};

interface ToggleGroupProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({ options, value, onChange }) => {
  return (
    <div style={{
      display: 'flex',
      background: Theme.Color.Base.Surface[3],
      padding: '3px',
      borderRadius: Theme.Radius.S,
      gap: '2px',
    }}>
      {options.map(opt => {
        const isActive = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              position: 'relative',
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '6px 0',
              cursor: 'pointer',
              color: isActive ? Theme.Color.Base.Content[1] : Theme.Color.Base.Content[3],
              ...Theme.Type.Readable.Label.XS,
              zIndex: 1,
              transition: 'color 0.2s',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="toggleHighlight"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: Theme.Color.Base.Surface[2],
                  borderRadius: '6px', // Slightly less than container
                  boxShadow: Theme.Effect.Shadow.Drop[1],
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            {opt.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};
