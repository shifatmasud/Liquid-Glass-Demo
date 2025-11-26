import React, { useRef, useState, useEffect, useId } from 'react';
import { generateGlassMaps } from '../../utils/generateGlassMaps';
import { LiquidGlassFilter } from '../Core/LiquidGlassFilter';

interface LiquidGlassProps {
  children: React.ReactNode;
  radius?: number;
  bezelWidth?: number;
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  radius = 24,
  bezelWidth = 30,
  intensity = 30,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapUrl, setMapUrl] = useState<string>('');
  
  // Ensure ID is safe for CSS selectors
  const rawId = useId();
  const filterId = `liquid-glass-${rawId.replace(/:/g, '')}`;

  useEffect(() => {
    if (!containerRef.current) return;

    let resizeTimeout: number;

    const updateMaps = () => {
      if (!containerRef.current) return;
      const { offsetWidth, offsetHeight } = containerRef.current;
      
      if (offsetWidth === 0 || offsetHeight === 0) return;

      const url = generateGlassMaps(
        offsetWidth,
        offsetHeight,
        radius,
        bezelWidth,
        10, // Default blur
        'convex'
      );

      setMapUrl(url);
    };

    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(updateMaps, 100);
    });

    ro.observe(containerRef.current);
    updateMaps();

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [bezelWidth, radius]);

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  const contentStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    filter: mapUrl ? `url(#${filterId})` : 'none',
    willChange: 'filter',
  };

  return (
    <div ref={containerRef} className={className} style={containerStyles}>
      {mapUrl && (
        <LiquidGlassFilter
          id={filterId}
          mapUrl={mapUrl}
          scale={intensity}
        />
      )}
      <div style={contentStyles}>
        {children}
      </div>
    </div>
  );
};