import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

// -----------------------------------------------------------------------------
// TIER 2: DESIGN SYSTEM (THEME)
// -----------------------------------------------------------------------------

const Theme = {
  Color: {
    Base: {
      Surface: {
        1: '#E8E8ED', // Studio Cool Grey
        2: '#FFFFFF', // Panel White
        3: '#F2F2F7', // Control Background
      },
      Content: {
        1: '#1D1D1F', // Primary Text
        2: '#86868B', // Secondary Text
        3: '#AEAEB2', // Tertiary
      },
    },
  },
  Type: {
    Readable: {
      Label: {
        S: { 
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
          fontSize: '13px', 
          fontWeight: 500, 
          letterSpacing: '-0.01em' 
        },
        XS: { 
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
          fontSize: '11px', 
          fontWeight: 600, 
          letterSpacing: '0.02em' 
        },
      },
    },
  },
  Space: { XS: 4, S: 8, M: 16, L: 24, XL: 48 },
  Radius: { S: 8, M: 16, Full: 9999 },
};

// -----------------------------------------------------------------------------
// UTILS: GLASS GENERATOR (RECT ONLY)
// -----------------------------------------------------------------------------

interface GlassMaps {
  surfaceUrl: string;
}

function generateGlassMaps(
  width: number,
  height: number,
  radius: number,
  bezel: number,
): GlassMaps {
  
  if (width <= 0 || height <= 0) return { surfaceUrl: '' };

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return { surfaceUrl: '' };

  const size = width * height;
  const heightMap = new Float32Array(size);

  const cx = width / 2;
  const cy = height / 2;
  
  // Safe radius clamping
  const r = Math.min(radius, Math.min(width, height) / 2);
  const bx = (width / 2) - r;
  const by = (height / 2) - r;

  // --- STAGE 1: GEOMETRY (Rounded Box SDF) ---
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      
      const dx = Math.abs(x - cx) - bx;
      const dy = Math.abs(y - cy) - by;
      const dOuter = Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);
      const dInner = Math.min(Math.max(dx, dy), 0);
      const dist = dOuter + dInner - r; 

      // Height Profile (0 to 1)
      let h = 0;
      if (dist < -bezel) h = 1.0;
      else if (dist > 1.0) h = 0.0;
      else {
        const t = Math.max(0, Math.min(1, -dist / bezel));
        // Smoothstep-like ease for glass slope
        h = t * t * (3 - 2 * t); 
      }

      heightMap[idx] = h;
    }
  }

  // --- STAGE 2: NORMALS & PACKING ---
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const steepness = 8.0; // Strong normals for glass

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
      
      // Normalize
      const len = Math.sqrt(dx * dx + dy * dy + 1.0);
      const nx = dx / len;
      const ny = dy / len;

      // Pack Data:
      // R: Normal X (0..255). 128 is 0.
      // G: Normal Y (0..255). 128 is 0.
      // B: Unused (Height)
      // A: 255 (Full Opacity). CRITICAL FIX: Do not use transparency.
      
      data[i] = (nx * 0.5 + 0.5) * 255;
      data[i + 1] = (ny * 0.5 + 0.5) * 255;
      data[i + 2] = hVal * 255; 
      data[i + 3] = 255; // ALWAYS OPAQUE
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return { surfaceUrl: canvas.toDataURL('image/png') };
}

// -----------------------------------------------------------------------------
// COMPONENTS: SECTIONS
// -----------------------------------------------------------------------------

const StudioBackground: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      background: '#F0F0F5', 
      pointerEvents: 'none',
    }}>
      {/* Engineering Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(#D6D6DD 1px, transparent 1px),
          linear-gradient(90deg, #D6D6DD 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        opacity: 0.8,
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(#E8E8ED 1px, transparent 1px),
          linear-gradient(90deg, #E8E8ED 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        opacity: 0.5,
      }} />
      
      {/* Studio Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(180,180,190,0.5) 100%)',
      }} />
    </div>
  );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; onChange: (v: number) => void }> = ({ label, value, min, max, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: Theme.Space.XS }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ ...Theme.Type.Readable.Label.S, color: Theme.Color.Base.Content[2] }}>{label}</span>
      <span style={{ ...Theme.Type.Readable.Label.XS, fontFamily: 'monospace', color: Theme.Color.Base.Content[1] }}>{value.toFixed(1)}</span>
    </div>
    <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
      <input
        type="range"
        min={min} max={max} step={0.1} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%', height: '4px', appearance: 'none',
          background: Theme.Color.Base.Surface[3], borderRadius: Theme.Radius.Full,
          outline: 'none', cursor: 'ew-resize',
        }}
        className="range-input"
      />
      <style>{`.range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: #000; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }`}</style>
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// COMPONENT: LIQUID GLASS FILTER (SVG DEF)
// -----------------------------------------------------------------------------

interface LiquidGlassFilterProps {
  id: string;
  mapUrl: string;
  width: number;
  height: number;
  intensity: number;
  chromaticDelta: number;
}

const LiquidGlassFilter: React.FC<LiquidGlassFilterProps> = React.memo(({
  id,
  mapUrl,
  width,
  height,
  intensity,
  chromaticDelta,
}) => {
  if (!width || !height) return null;

  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        <filter 
          id={id} 
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
          x="0" y="0" 
          width={width} 
          height={height}
        >
          {/* Source Map */}
          <feImage 
            href={mapUrl} 
            result="map" 
            x="0" y="0" 
            width={width} 
            height={height} 
            preserveAspectRatio="none"
          />

          {/* 
             SPECTRAL DISPLACEMENT 
             We split the displacement into R, G, B channels with offsets.
          */}

          {/* Red Channel: Scale + Delta */}
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="map" 
            scale={intensity + chromaticDelta} 
            xChannelSelector="R" 
            yChannelSelector="G" 
            result="dispR"
          />

          {/* Green Channel: Base Scale */}
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="map" 
            scale={intensity} 
            xChannelSelector="R" 
            yChannelSelector="G" 
            result="dispG"
          />

          {/* Blue Channel: Scale - Delta */}
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="map" 
            scale={intensity - chromaticDelta} 
            xChannelSelector="R" 
            yChannelSelector="G" 
            result="dispB"
          />

          {/* 
             RECOMBINATION
             We need to take the Red component from dispR, Green from dispG, Blue from dispB.
          */}
          
          <feComponentTransfer in="dispR" result="R">
            <feFuncR type="identity"/>
            <feFuncG type="discrete" tableValues="0"/>
            <feFuncB type="discrete" tableValues="0"/>
            <feFuncA type="identity"/> 
          </feComponentTransfer>
          
          <feComponentTransfer in="dispG" result="G">
            <feFuncR type="discrete" tableValues="0"/>
            <feFuncG type="identity"/>
            <feFuncB type="discrete" tableValues="0"/>
            <feFuncA type="identity"/>
          </feComponentTransfer>
          
          <feComponentTransfer in="dispB" result="B">
            <feFuncR type="discrete" tableValues="0"/>
            <feFuncG type="discrete" tableValues="0"/>
            <feFuncB type="identity"/>
            <feFuncA type="identity"/>
          </feComponentTransfer>

          {/* Merge channels. Arithmetic add works well here since channels are isolated. */}
          <feComposite operator="arithmetic" k2="1" k3="1" in="R" in2="G" result="RG" />
          <feComposite operator="arithmetic" k2="1" k3="1" in="RG" in2="B" result="RGB" />

        </filter>
      </defs>
    </svg>
  );
});

// -----------------------------------------------------------------------------
// COMPONENT: GLASS BUBBLE (PARENT-CHILD ARCHITECTURE)
// -----------------------------------------------------------------------------

interface GlassBubbleProps {
  radius?: number;
  bezel?: number;
  intensity?: number;
  chromaticDelta?: number;
  frost?: number;
  highlight?: number;
  dropShadow?: number;
  volumeShadow?: number;
  debug?: boolean;
}

export const GlassBubble: React.FC<GlassBubbleProps> = ({
  radius = 80,
  bezel = 40,
  intensity = 30,
  chromaticDelta = 0,
  frost = 0,
  highlight = 0.5,
  dropShadow = 0.5,
  volumeShadow = 0.5,
  debug = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapUrl, setMapUrl] = useState<string>('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const rawId = useId();
  const filterId = `glass-refract-${rawId.replace(/[:]/g, '')}`;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const w = Math.ceil(entry.contentRect.width);
        const h = Math.ceil(entry.contentRect.height);
        setDimensions({ width: w, height: h });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    const timeout = setTimeout(() => {
      const { surfaceUrl } = generateGlassMaps(
        dimensions.width,
        dimensions.height,
        radius,
        bezel
      );
      setMapUrl(surfaceUrl);
    }, 50);
    return () => clearTimeout(timeout);
  }, [dimensions, radius, bezel]);

  // STYLES
  const containerStyle: React.CSSProperties = {
    position: 'relative', 
    width: '100%', 
    height: '100%',
    borderRadius: radius,
    // PARENT: Handles Refraction via SVG Filter
    // Combines with FROST (blur)
    backdropFilter: mapUrl ? `url(#${filterId}) blur(${frost}px)` : `blur(${frost}px)`,
    WebkitBackdropFilter: mapUrl ? `url(#${filterId}) blur(${frost}px)` : `blur(${frost}px)`,
    
    // PARENT: Handles Shape Clipping
    overflow: 'hidden',
    // PARENT: Handles Drop Shadow - Realistic diffused look
    boxShadow: `
      0 50px 100px -20px rgba(0,0,0,${dropShadow * 0.25}),
      0 30px 60px -30px rgba(0,0,0,${dropShadow * 0.3})
    `,
    zIndex: 10,
    transition: 'all 0.2s ease-out'
  };

  const layerInset: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: radius,
    pointerEvents: 'none',
  };

  return (
    <motion.div 
      ref={containerRef} 
      style={containerStyle}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* RENDER THE SVG FILTER */}
      {mapUrl && (
        <LiquidGlassFilter 
          id={filterId}
          mapUrl={mapUrl}
          width={dimensions.width}
          height={dimensions.height}
          intensity={intensity}
          chromaticDelta={chromaticDelta}
        />
      )}

      {/* CHILD 1: VOLUME (Dark Inner Edges) */}
      <div style={{
        ...layerInset,
        boxShadow: `
          inset 0 0 ${bezel}px rgba(0,0,0,${volumeShadow * 0.25}),
          inset 0 0 10px rgba(0,0,0,${volumeShadow * 0.25})
        `,
        mixBlendMode: 'multiply',
        zIndex: 1,
      }} />

      {/* CHILD 2: SPECULAR (Rim Light & Gloss) */}
      <div style={{
        ...layerInset,
        boxShadow: `
          inset 0 1px 0 0 rgba(255,255,255, ${highlight * 0.9}),
          inset 0 -1px 0 0 rgba(255,255,255, ${highlight * 0.3})
        `,
        background: `
          radial-gradient(100% 100% at 30% 20%, rgba(255,255,255,${highlight * 0.6}) 0%, transparent 40%),
          linear-gradient(180deg, rgba(255,255,255,${highlight * 0.1}) 0%, transparent 100%)
        `,
        zIndex: 3,
      }} />
      
      {/* CHILD 3: FROST OVERLAY (Subtle Noise/Grain could be added here if needed) */}
      {frost > 0 && (
         <div style={{
            ...layerInset,
            backgroundColor: `rgba(255,255,255, ${Math.min(0.2, frost * 0.02)})`,
            zIndex: 2,
         }} />
      )}

      {/* Debug View */}
      {debug && mapUrl && (
        <div style={{
          ...layerInset,
          backgroundImage: `url("${mapUrl}")`, 
          backgroundSize: '100% 100%',
          opacity: 0.8,
          zIndex: 100
        }} />
      )}
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// APP: META GLASS
// -----------------------------------------------------------------------------

interface GlassState {
  bezel: number;
  intensity: number;
  chromaticDelta: number;
  frost: number;
  highlight: number;
  radius: number;
  dropShadow: number;
  volumeShadow: number;
  debug: 'off' | 'on';
}

const DraggableWindow: React.FC<{
  id: string; title: string; isOpen: boolean; onClose: () => void;
  width?: string; children: React.ReactNode;
}> = ({ id, title, isOpen, onClose, width = '300px', children }) => {
  const dragControls = useDragControls();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          drag dragControls={dragControls} dragListener={false} dragMomentum={false}
          initial={{ opacity: 0, y: 20, x: '-50%', left: '50%', top: '100px' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{
            position: 'absolute', width, background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '20px', 
            boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 24px 60px -12px rgba(0,0,0,0.15)',
            zIndex: 100, overflow: 'hidden'
          }}
        >
          <div onPointerDown={(e) => dragControls.start(e)} style={{
            height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'grab'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>{title}</span>
            <button onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57', border: 'none', cursor: 'pointer' }} />
          </div>
          <div style={{ padding: '24px' }}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MetaGlassApp = () => {
  const [glass, setGlass] = useState<GlassState>({
    bezel: 40, 
    intensity: 30, 
    chromaticDelta: 8, 
    frost: 0, 
    highlight: 0.6, 
    radius: 80, 
    dropShadow: 0.6,
    volumeShadow: 0.5,
    debug: 'off',
  });
  const [windows, setWindows] = useState([{ id: 'controls', isOpen: true }]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <StudioBackground />
      
      <motion.div 
         style={{
           position: 'absolute', top: '50%', left: '50%',
           width: 'clamp(300px, 50vw, 600px)', height: 'clamp(200px, 30vw, 360px)', 
           zIndex: 10, cursor: 'grab'
         }}
         initial={{ x: '-50%', y: '-50%' }}
         drag dragMomentum={true}
      >
         <GlassBubble {...glass} debug={glass.debug === 'on'} />
      </motion.div>

      {windows.map(w => (
        <DraggableWindow key={w.id} id={w.id} title="Liquid Physics" isOpen={w.isOpen} onClose={() => setWindows([])}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Slider label="Refraction" value={glass.intensity} min={0} max={100} onChange={v => setGlass(p => ({ ...p, intensity: v }))} />
              <Slider label="Dispersion (RGB)" value={glass.chromaticDelta} min={0} max={30} onChange={v => setGlass(p => ({ ...p, chromaticDelta: v }))} />
              <Slider label="Frost (Blur)" value={glass.frost} min={0} max={20} onChange={v => setGlass(p => ({ ...p, frost: v }))} />
              <Slider label="Specular Highlight" value={glass.highlight} min={0} max={1} onChange={v => setGlass(p => ({ ...p, highlight: v }))} />
              
              <div style={{ height: 1, background: 'rgba(0,0,0,0.1)' }} />
              
              <Slider label="Shadow (Drop)" value={glass.dropShadow} min={0} max={1} onChange={v => setGlass(p => ({ ...p, dropShadow: v }))} />
              <Slider label="Volume (Inner)" value={glass.volumeShadow} min={0} max={1} onChange={v => setGlass(p => ({ ...p, volumeShadow: v }))} />
              <Slider label="Bezel Depth" value={glass.bezel} min={0} max={100} onChange={v => setGlass(p => ({ ...p, bezel: v }))} />
              <Slider label="Corner Radius" value={glass.radius} min={0} max={120} onChange={v => setGlass(p => ({ ...p, radius: v }))} />
           </div>
        </DraggableWindow>
      ))}
      
      <div style={{ position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
        <button onClick={() => setWindows([{ id: 'controls', isOpen: true }])} style={{ 
          pointerEvents: 'auto', background: '#fff', border: 'none', padding: '12px 24px', 
          borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600, cursor: 'pointer',
          color: '#333', fontSize: '13px'
        }}>
          Open Controls
        </button>
      </div>
    </div>
  );
};