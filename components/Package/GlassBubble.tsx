import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import { generateGlassMaps, GlassShape } from '../../utils/glassGenerator';
import { Theme } from '../../utils/theme';
import { motion } from 'framer-motion';

interface GlassBubbleProps {
  radius?: number;
  bezel?: number;
  intensity?: number;
  blur?: number;
  debug?: boolean;
  shape?: GlassShape;
}

export const GlassBubble: React.FC<GlassBubbleProps> = ({
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
  
  // Unique ID for the filter to support multiple instances
  const rawId = useId();
  // Safe CSS ID
  const filterId = `liquid-glass-${rawId.replace(/[:]/g, '')}`;

  // 1. Efficient Resize Observation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // Rounding is crucial for 1:1 pixel mapping in filters
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        
        setDimensions(prev => {
           if (prev.width === w && prev.height === h) return prev;
           return { width: w, height: h };
        });
      }
    });
    
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. Map Generation (Debounced)
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const timeout = setTimeout(() => {
      const { surfaceUrl } = generateGlassMaps(
        dimensions.width,
        dimensions.height,
        radius,
        bezel,
        shape as GlassShape,
        'convex',
        2.0
      );
      setMapUrl(surfaceUrl);
    }, 50);

    return () => clearTimeout(timeout);
  }, [dimensions.width, dimensions.height, radius, bezel, shape]);

  // 3. SVG Filter Definition
  const filterSvg = useMemo(() => {
    if (!dimensions.width || !dimensions.height) return null;

    return (
      <svg 
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} 
        aria-hidden="true"
      >
        <defs>
          <filter 
            id={filterId} 
            colorInterpolationFilters="sRGB" 
            filterUnits="userSpaceOnUse"
            x="0" y="0" 
            width={dimensions.width} 
            height={dimensions.height}
          >
            {/* Input displacement map */}
            <feImage 
              href={mapUrl} 
              result="map" 
              x="0" y="0" 
              width={dimensions.width} 
              height={dimensions.height}
              preserveAspectRatio="none"
            />

            {/* Displacement Pass using Red (X) and Green (Y) channels */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={intensity}
              xChannelSelector="R"
              yChannelSelector="G"
              result="disp"
            />
          </filter>
        </defs>
      </svg>
    );
  }, [filterId, mapUrl, intensity, dimensions.width, dimensions.height]);

  const glassStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    // If squircle, we remove border radius as the shape is defined by the map mask
    borderRadius: shape === 'rect' ? `${radius}px` : '0px',
    
    // BACKDROP FILTER STACK
    backdropFilter: mapUrl ? `url(#${filterId}) blur(${blur}px)` : `blur(${blur}px)`,
    WebkitBackdropFilter: mapUrl ? `url(#${filterId}) blur(${blur}px)` : `blur(${blur}px)`,
    
    willChange: 'backdrop-filter',
    
    // SURFACE
    backgroundColor: debug ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.02)',
    boxShadow: shape === 'rect' ? `
      inset 0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
      0 20px 40px -10px rgba(0, 0, 0, 0.4)
    ` : 'none', // Squircles rely on the map's alpha for shape
    
    // For squircle, we need to mask the box to match the generated shape
    // The generator puts the mask in the Alpha channel of the map image.
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

      {/* Content Label */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 3
      }}>
         <motion.span 
           style={{ 
             ...Theme.Type.Expressive.Display.M, 
             fontSize: 'clamp(2rem, 6vw, 4rem)',
             color: 'rgba(255,255,255,0.9)',
             textShadow: '0 4px 20px rgba(0,0,0,0.3)',
             mixBlendMode: 'overlay',
             letterSpacing: '0.05em'
           }}
           animate={{ opacity: [0.7, 1, 0.7] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         >
           LIQUID
         </motion.span>
      </div>

      {debug && mapUrl && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          backgroundImage: `url("${mapUrl}")`,
          backgroundSize: '100% 100%',
          opacity: 0.9,
          pointerEvents: 'none',
          border: '2px solid #F59E0B',
        }} />
      )}
    </motion.div>
  );
};