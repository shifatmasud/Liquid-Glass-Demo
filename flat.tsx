import React, { useState, useEffect, useRef, useId, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Faders, Code, TerminalWindow } from '@phosphor-icons/react';

// -----------------------------------------------------------------------------
// TIER 2: DESIGN SYSTEM (THEME)
// -----------------------------------------------------------------------------

const Theme = {
  Color: {
    Base: {
      Surface: {
        1: '#050505', // Deepest background (Void)
        2: '#0F0F0F', // Secondary background (Panel)
        3: '#1A1A1A', // Tertiary background (Card)
      },
      Content: {
        1: '#FFFFFF', // Primary text
        2: '#A1A1AA', // Secondary text
        3: '#52525B', // Tertiary text/icons
      },
    },
    Fixed: {
      Error: '#EF4444',
      Success: '#10B981',
      Warning: '#F59E0B',
      Info: '#3B82F6',
    },
    Effect: {
      Glass: {
        Surface: 'rgba(20, 20, 20, 0.6)',
        SurfaceHighlight: 'rgba(255, 255, 255, 0.05)',
        Border: 'rgba(255, 255, 255, 0.08)',
        Shadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  Type: {
    Expressive: {
      Display: {
        M: { fontFamily: '"Bebas Neue", sans-serif', fontSize: '3rem', lineHeight: 1 },
      },
    },
    Readable: {
      Body: {
        M: { fontFamily: '"Inter", sans-serif', fontSize: '16px', lineHeight: 1.6, fontWeight: 400 },
      },
      Label: {
        S: { fontFamily: '"Inter", sans-serif', fontSize: '12px', lineHeight: 1, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' },
        XS: { fontFamily: '"Inter", sans-serif', fontSize: '10px', lineHeight: 1, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
      },
      Code: {
        M: { fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.5 },
      }
    },
  },
  Space: {
    XS: 4,
    S: 8,
    M: 16,
    L: 24,
    XL: 48,
  },
  Radius: {
    S: 8,
    M: 16,
    Full: 9999,
  },
  Effect: {
    Blur: {
      M: '12px',
      L: '20px',
    },
    Shadow: {
      Drop: {
        1: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
};

// -----------------------------------------------------------------------------
// UTILS: GLASS GENERATOR
// -----------------------------------------------------------------------------

export type GlassShapeProfile = 'convex' | 'concave' | 'flat' | 'liquid';
export type GlassShape = 'rect' | 'squircle';

interface GlassMaps {
  surfaceUrl: string;
}

function generateGlassMaps(
  width: number,
  height: number,
  radius: number,
  bezel: number,
  shape: GlassShape = 'rect',
  profile: GlassShapeProfile = 'convex',
  tension: number = 2.0,
  warp: number = 0.0
): GlassMaps {
  
  if (width <= 0 || height <= 0) return { surfaceUrl: '' };

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return { surfaceUrl: '' };

  // --- INIT BUFFERS ---
  const size = width * height;
  const heightMap = new Float32Array(size);
  const tempMap = new Float32Array(size); // For erosion pass

  const cx = width / 2;
  const cy = height / 2;
  
  // Safe radius clamping
  const r = Math.min(radius, Math.min(width, height) / 2);
  const bx = (width / 2) - r;
  const by = (height / 2) - r;

  // --- NOISE GENERATOR (For Turbulence) ---
  const perm = new Uint8Array(512);
  for(let i=0; i<512; i++) perm[i] = Math.floor(Math.random() * 255);
  
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  const noise2d = (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const A = perm[X] + Y, B = perm[X+1] + Y;
    return lerp(v, lerp(u, grad(perm[A], xf, yf), grad(perm[B], xf-1, yf)),
                   lerp(u, grad(perm[A+1], xf, yf-1), grad(perm[B+1], xf-1, yf-1)));
  };

  // --- STAGE 1 & 2: GEOMETRY & TURBULENCE ---
  const warpScale = 0.02; 
  const isLiquid = profile === 'liquid';
  const warpAmp = warp * (isLiquid ? 15 : 8);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      // STAGE 2: Apply Liquid Turbulence
      let tx = x;
      let ty = y;
      if (warp > 0 || isLiquid) {
         const n = noise2d(x * warpScale, y * warpScale);
         tx += n * warpAmp;
         ty += n * warpAmp;
      }

      let dist = 0;
      if (shape === 'squircle') {
          // Squircle SDF Approximation (Superellipse n=4)
          // |x/a|^4 + |y/b|^4 = 1
          const nx = (tx - cx) / (width / 2);
          const ny = (ty - cy) / (height / 2);
          const val = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);
          
          // Approx distance from edge: (v^0.25 - 1) * radius_scale
          dist = (Math.pow(val, 0.25) - 1.0) * (Math.min(width, height) / 2);
      } else {
          // Rounded Box SDF
          const dx = Math.abs(tx - cx) - bx;
          const dy = Math.abs(ty - cy) - by;
          const dOuter = Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);
          const dInner = Math.min(Math.max(dx, dy), 0);
          dist = dOuter + dInner - r; 
      }

      // Map Distance to Height Profile
      // dist < -bezel : Plateau (1.0)
      // dist > 0      : Outside (0.0)
      // -bezel < dist < 0 : Slope
      let h = 0;
      if (dist < -bezel) h = 1.0;
      else if (dist > 1.0) h = 0.0;
      else {
        const t = Math.max(0, Math.min(1, -dist / bezel));
        // Shape Profiling
        if (profile === 'flat') h = t;
        else if (profile === 'concave') h = 1.0 - Math.pow(t, 2);
        else h = 1 - Math.pow(1 - t, 3); // Convex/Liquid easing
      }

      // Add surface noise for liquid mode
      if (isLiquid && h > 0.8) {
          h += noise2d(x * 0.015, y * 0.015) * 0.03;
      }

      heightMap[idx] = Math.max(0, Math.min(1, h));
    }
  }

  // --- STAGE 3: EROSION (Gaussian Blur) ---
  if (tension > 0) {
     const kernel = Math.max(1, Math.ceil(tension));
     // Horizontal Pass
     for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
           let sum = 0, weight = 0;
           for (let k = -kernel; k <= kernel; k++) {
              const px = Math.min(width - 1, Math.max(0, x + k));
              sum += heightMap[y * width + px];
              weight++;
           }
           tempMap[y * width + x] = sum / weight;
        }
     }
     // Vertical Pass
     for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
           let sum = 0, weight = 0;
           for (let k = -kernel; k <= kernel; k++) {
              const py = Math.min(height - 1, Math.max(0, y + k));
              sum += tempMap[py * width + x];
              weight++;
           }
           heightMap[y * width + x] = sum / weight;
        }
     }
  }

  // --- STAGE 4 & 5: NORMALS & PACKING ---
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const steepness = 4.0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      
      const x0 = Math.max(0, x - 1);
      const x1 = Math.min(width - 1, x + 1);
      const y0 = Math.max(0, y - 1);
      const y1 = Math.min(height - 1, y + 1);
      
      const hVal = heightMap[y * width + x];
      const dx = (heightMap[y * width + x0] - heightMap[y * width + x1]) * steepness;
      const dy = (heightMap[y0 * width + x] - heightMap[y1 * width + x]) * steepness;
      
      const len = Math.sqrt(dx * dx + dy * dy + 1.0);
      const nx = dx / len;
      const ny = dy / len;

      data[i] = (nx * 0.5 + 0.5) * 255;     // R
      data[i + 1] = (ny * 0.5 + 0.5) * 255; // G
      data[i + 2] = hVal * 255;             // B
      data[i + 3] = hVal > 0.01 ? 255 : 0;  // A
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return { surfaceUrl: canvas.toDataURL('image/png') };
}

// -----------------------------------------------------------------------------
// COMPONENTS: SECTIONS
// -----------------------------------------------------------------------------

const Background: React.FC = () => {
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

// -----------------------------------------------------------------------------
// COMPONENTS: CORE CONTROLS
// -----------------------------------------------------------------------------

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, onChange }) => {
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

const ToggleGroup: React.FC<ToggleGroupProps> = ({ options, value, onChange }) => {
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
                  borderRadius: '6px',
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

// -----------------------------------------------------------------------------
// COMPONENTS: DRAGGABLE WINDOW (#MP)
// -----------------------------------------------------------------------------

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
}

const DraggableWindow: React.FC<DraggableWindowProps> = React.memo(({
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
          dragListener={false}
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0}
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
            touchAction: 'none',
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
            <span style={{ 
              ...Theme.Type.Readable.Label.S, 
              color: Theme.Color.Base.Content[2],
              letterSpacing: '0.05em',
              pointerEvents: 'none',
            }}>
              {title.toUpperCase()}
            </span>

            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Close"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: '#FF4433',
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

          <div 
             onPointerDown={(e) => e.stopPropagation()} 
             style={{ 
                padding: Theme.Space.M, 
                overflowY: 'auto', 
                flex: 1, 
                maxHeight: '60vh',
                scrollbarWidth: 'none',
             }}
          >
            {children}
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// -----------------------------------------------------------------------------
// COMPONENTS: DOCK
// -----------------------------------------------------------------------------

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

const Dock: React.FC<DockProps> = ({ items, onToggle }) => {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
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

// -----------------------------------------------------------------------------
// COMPONENTS: CONSOLE & CODE
// -----------------------------------------------------------------------------

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'action' | 'system';
}

const Console: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', justifyContent: 'flex-start' }}>
      {logs.length === 0 && (
        <div style={{ ...Theme.Type.Readable.Code.M, color: Theme.Color.Base.Content[3], textAlign: 'center', marginTop: '20px' }}>_</div>
      )}
      {logs.map((log, index) => (
        <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '12px', ...Theme.Type.Readable.Code.M, fontSize: '11px', opacity: Math.max(0.4, 1 - (logs.length - 1 - index) * 0.1) }}>
          <span style={{ color: Theme.Color.Base.Content[3], textAlign: 'right' }}>{log.timestamp.split(' ')[0]}</span>
          <span style={{ color: log.type === 'action' ? '#79C0FF' : log.type === 'system' ? '#E2E8F0' : Theme.Color.Base.Content[2], wordBreak: 'break-word' }}>
            {log.type === 'system' && <span style={{ color: Theme.Color.Fixed.Warning, marginRight: '8px' }}>➜</span>}
            {log.message}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

const CodeIO: React.FC = () => {
  const styles = {
    wrapper: { display: 'flex', flexDirection: 'column' as const, gap: Theme.Space.M },
    section: { display: 'flex', flexDirection: 'column' as const, gap: Theme.Space.XS },
    label: { ...Theme.Type.Readable.Label.XS, color: Theme.Color.Base.Content[3], letterSpacing: '0.1em' },
    block: { ...Theme.Type.Readable.Code.M, fontSize: '11px', background: 'rgba(0,0,0,0.4)', padding: Theme.Space.M, borderRadius: Theme.Radius.S, color: Theme.Color.Base.Content[2], border: `1px solid ${Theme.Color.Base.Surface[3]}`, whiteSpace: 'pre-wrap' as const, fontFamily: '"JetBrains Mono", monospace' },
    keyword: { color: '#FF7B72' }, prop: { color: '#D2A8FF' }, value: { color: '#79C0FF' }, comment: { color: '#6E7681', fontStyle: 'italic' },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.section}>
        <span style={styles.label}>INPUT (Filter Props)</span>
        <div style={styles.block}>
          {`{
  "feDisplacementMap": {
    "in": "SourceGraphic",
    "in2": "displacementMap",
    "scale": `}<span style={styles.value}>30</span>{`,
    "xChannelSelector": "R",
    "yChannelSelector": "G"
  }
}`}
        </div>
      </div>
      <div style={styles.section}>
        <span style={styles.label}>SURFACE FUNCTION (Squircle)</span>
        <div style={styles.block}>
          <span style={styles.keyword}>const</span> val = <span style={styles.prop}>pow</span>(<span style={styles.prop}>abs</span>(u), 4) + <span style={styles.prop}>pow</span>(<span style={styles.prop}>abs</span>(v), 4);
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// COMPONENTS: GLASS BUBBLE
// -----------------------------------------------------------------------------

interface GlassBubbleProps {
  radius?: number;
  bezel?: number;
  intensity?: number;
  blur?: number;
  debug?: boolean;
  shape?: GlassShape;
}

const GlassBubble: React.FC<GlassBubbleProps> = ({
  radius = 32,
  bezel = 24,
  intensity = 30,
  blur = 2,
  debug = false,
  shape = 'rect',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapUrl, setMapUrl] = useState<string>('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const rawId = useId();
  const filterId = `liquid-glass-${rawId.replace(/[:]/g, '')}`;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        setDimensions(prev => (prev.width === w && prev.height === h) ? prev : { width: w, height: h });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    const timeout = setTimeout(() => {
      const { surfaceUrl } = generateGlassMaps(dimensions.width, dimensions.height, radius, bezel, shape, 'convex', 2.0);
      setMapUrl(surfaceUrl);
    }, 50);
    return () => clearTimeout(timeout);
  }, [dimensions.width, dimensions.height, radius, bezel, shape]);

  const filterSvg = useMemo(() => {
    if (!dimensions.width || !dimensions.height) return null;
    return (
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" x="0" y="0" width={dimensions.width} height={dimensions.height}>
            <feImage href={mapUrl} result="map" x="0" y="0" width={dimensions.width} height={dimensions.height} preserveAspectRatio="none" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={intensity} xChannelSelector="R" yChannelSelector="G" result="disp" />
          </filter>
        </defs>
      </svg>
    );
  }, [filterId, mapUrl, intensity, dimensions.width, dimensions.height]);

  const glassStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: shape === 'rect' ? `${radius}px` : '0px',
    backdropFilter: mapUrl ? `url(#${filterId}) blur(${blur}px)` : `blur(${blur}px)`,
    WebkitBackdropFilter: mapUrl ? `url(#${filterId}) blur(${blur}px)` : `blur(${blur}px)`,
    willChange: 'backdrop-filter',
    backgroundColor: debug ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.02)',
    boxShadow: shape === 'rect' ? `inset 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 20px 40px -10px rgba(0, 0, 0, 0.4)` : 'none',
    maskImage: mapUrl ? `url("${mapUrl}")` : 'none',
    WebkitMaskImage: mapUrl ? `url("${mapUrl}")` : 'none',
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
    transition: 'all 0.1s linear', 
    zIndex: 2,
    overflow: 'hidden',
  };

  return (
    <motion.div 
      ref={containerRef} 
      style={{ position: 'relative', width: '100%', height: '100%' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {mapUrl && filterSvg}
      <div style={glassStyle} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 3 }}>
         <motion.span 
           style={{ ...Theme.Type.Expressive.Display.M, fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'rgba(255,255,255,0.9)', textShadow: '0 4px 20px rgba(0,0,0,0.3)', mixBlendMode: 'overlay', letterSpacing: '0.05em' }}
           animate={{ opacity: [0.7, 1, 0.7] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         >
           LIQUID
         </motion.span>
      </div>
      {debug && mapUrl && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, backgroundImage: `url("${mapUrl}")`, backgroundSize: '100% 100%', opacity: 0.9, pointerEvents: 'none', border: '2px solid #F59E0B' }} />
      )}
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// MAIN APP: META GLASS
// -----------------------------------------------------------------------------

interface GlassState {
  bezel: number;
  intensity: number;
  blur: number;
  radius: number;
  debug: 'off' | 'on';
  shape: GlassShape;
}

export const MetaGlassApp = () => {
  const [glass, setGlass] = useState<GlassState>({ bezel: 24, intensity: 40, blur: 0, radius: 48, debug: 'off', shape: 'rect' });
  const [windows, setWindows] = useState([
    { id: 'controls', isOpen: true, zIndex: 10, title: 'Controls', icon: <Faders size={20} weight="duotone" /> },
    { id: 'code', isOpen: false, zIndex: 9, title: 'Code I/O', icon: <Code size={20} weight="duotone" /> },
    { id: 'console', isOpen: false, zIndex: 8, title: 'Console', icon: <TerminalWindow size={20} weight="duotone" /> },
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([{ id: 1, timestamp: new Date().toLocaleTimeString(), message: 'System initialized. Performance mode active.', type: 'system' }]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => {
      const newLogs = [...prev, { id: Date.now(), timestamp: new Date().toLocaleTimeString(), message, type }];
      return newLogs.slice(-50);
    });
  }, []);

  const updateGlass = useCallback((key: keyof GlassState, val: any) => {
    setGlass(prev => ({ ...prev, [key]: val }));
    if (Math.random() > 0.95) addLog(`Property [${key}] updated to ${val}`, 'action');
  }, [addLog]);

  const toggleWindow = useCallback((id: string) => {
    setWindows(prev => {
      const target = prev.find(w => w.id === id);
      if (!target) return prev;
      const wasOpen = target.isOpen;
      if (!wasOpen) addLog(`Process spawned: ${target.title}`, 'system');
      const maxZ = Math.max(...prev.map(w => w.zIndex));
      return prev.map(w => w.id === id ? { ...w, isOpen: !wasOpen, zIndex: !wasOpen ? maxZ + 1 : w.zIndex } : w);
    });
  }, [addLog]);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      const target = prev.find(w => w.id === id);
      const maxZ = Math.max(...prev.map(w => w.zIndex));
      if (target && target.zIndex === maxZ) return prev;
      return prev.map(w => ({ ...w, zIndex: w.id === id ? maxZ + 1 : w.zIndex }));
    });
  }, []);

  const styles = {
    container: { width: '100vw', height: '100vh', position: 'relative' as const, overflow: 'hidden', fontFamily: Theme.Type.Readable.Body.M.fontFamily, color: Theme.Color.Base.Content[1], background: Theme.Color.Base.Surface[1], userSelect: 'none' as const },
    glassContainer: { position: 'absolute' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'clamp(300px, 40vw, 500px)', height: 'clamp(300px, 40vw, 500px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }
  };

  return (
    <div style={styles.container}>
      <Background />
      <div style={styles.glassContainer}>
         <GlassBubble {...glass} debug={glass.debug === 'on'} />
      </div>
      {windows.map((win) => (
        <DraggableWindow
          key={win.id}
          id={win.id}
          title={win.title}
          isOpen={win.isOpen}
          zIndex={win.zIndex}
          onClose={() => toggleWindow(win.id)}
          onFocus={() => focusWindow(win.id)}
          width={win.id === 'code' ? '420px' : '300px'}
          height={win.id === 'console' ? '280px' : 'auto'}
        >
          {win.id === 'controls' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: Theme.Space.L }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: Theme.Space.S }}>
                  <label style={Theme.Type.Readable.Label.S}>Debug Visualization</label>
                  <ToggleGroup options={['off', 'on']} value={glass.debug} onChange={(v) => { updateGlass('debug', v); addLog(`Debug mode switched ${v}`, 'system'); }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: Theme.Space.S }}>
                  <label style={Theme.Type.Readable.Label.S}>Geometry</label>
                  <ToggleGroup options={['rect', 'squircle']} value={glass.shape} onChange={(v) => { updateGlass('shape', v as GlassShape); addLog(`Shape updated to ${v}`, 'action'); }} />
               </div>
               <div style={{ height: '1px', background: Theme.Color.Base.Surface[3] }} />
               <Slider label="Refraction Intensity" value={glass.intensity} min={0} max={100} onChange={(v) => updateGlass('intensity', v)} />
               <Slider label="Bezel Width" value={glass.bezel} min={0} max={100} onChange={(v) => updateGlass('bezel', v)} />
               <Slider label="Surface Blur" value={glass.blur} min={0} max={20} onChange={(v) => updateGlass('blur', v)} />
               {glass.shape === 'rect' && (
                 <Slider label="Corner Radius" value={glass.radius} min={0} max={250} onChange={(v) => updateGlass('radius', v)} />
               )}
            </div>
          )}
          {win.id === 'code' && <CodeIO />}
          {win.id === 'console' && <Console logs={logs} />}
        </DraggableWindow>
      ))}
      <Dock items={windows} onToggle={toggleWindow} />
    </div>
  );
};
