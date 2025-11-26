
import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import { GlassSVGDefinitions } from './GlassSVGDefinitions';
import { generateGlassMaps } from '../../utils/generateGlassMaps';

interface GlassOverlayProps {
  /** Radius of the corners in pixels. Can be single number or [tl, tr, br, bl] */
  radius?: number | [number, number, number, number];
  /** Width of the beveled liquid edge in pixels */
  bezel?: number;
  /** Intensity of the background blur (backdrop-filter) */
  bgBlur?: number;
  /** Strength of the refraction displacement */
  refraction?: number;
  /** Normalized Light Direction (-1 to 1) */
  lightDirection?: { x: number; y: number };
  /** Show the displacement map for debugging */
  debug?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const GlassOverlay: React.FC<GlassOverlayProps> = ({
  radius = 24,
  bezel = 16,
  bgBlur = 12,
  refraction = 20,
  lightDirection = { x: 0.5, y: -0.5 },
  debug = false,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapUrl, setMapUrl] = useState<string>('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const rawId = useId();
  const filterId = `glass-refract-${rawId.replace(/:/g, '')}`;

  // 1. Observe Size Changes
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Generate Map when Dimensions or Shape Props change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    // Debounce slightly to prevent thrashing
    const timer = setTimeout(() => {
      const url = generateGlassMaps(
        dimensions.width,
        dimensions.height,
        radius,
        bezel,
        15, // blur
        'convex'
      );
      setMapUrl(url);
    }, 50);

    return () => clearTimeout(timer);
  }, [dimensions.width, dimensions.height, radius, bezel]);

  // 3. Calculate Light Position for SVG (assuming standard coordinate space)
  const lightPos = useMemo(() => ({
    x: dimensions.width / 2 + (lightDirection.x * dimensions.width),
    y: dimensions.height / 2 + (lightDirection.y * dimensions.height),
    z: 60, // Light height
  }), [lightDirection, dimensions]);

  // CSS Border Radius helper
  const borderRadiusCSS = Array.isArray(radius) 
    ? `${radius[0]}px ${radius[1]}px ${radius[2]}px ${radius[3]}px`
    : `${radius}px`;

  return (
    <>
      {/* Defines the Filter Logic - Only renders if map is ready */}
      {mapUrl && (
        <GlassSVGDefinitions
          filterId={filterId}
          mapUrl={mapUrl}
          lightPos={lightPos}
          refractionScale={refraction}
          specularConstant={1.5}
          lightingIntensity={20} // Depth of the bezel
        />
      )}

      {/* The Actual Overlay Element */}
      <div 
        ref={containerRef} 
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: borderRadiusCSS,
          pointerEvents: 'none',
          
          // MATERIAL:
          // 1. Blur the background
          // 2. Apply the generated filter via URL (Chromium only currently)
          backdropFilter: mapUrl ? `url(#${filterId}) blur(${bgBlur}px)` : `blur(${bgBlur}px)`,
          WebkitBackdropFilter: mapUrl ? `url(#${filterId}) blur(${bgBlur}px)` : `blur(${bgBlur}px)`,
          
          // 3. Base tint
          backgroundColor: debug ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 20px 40px -10px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)',

          willChange: 'backdrop-filter',
          zIndex: 10,
          ...style
        }}
      >
        {/* DEBUG LAYER: Show the map if requested */}
        {debug && mapUrl && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${mapUrl}")`,
            backgroundSize: '100% 100%',
            opacity: 0.8,
            borderRadius: borderRadiusCSS,
            zIndex: 20
          }} />
        )}
      </div>
    </>
  );
};
