
import React from 'react';

interface LiquidGlassFilterProps {
  id: string;
  mapUrl: string;
  scale: number;
  chromaticDelta?: number; // How much R and B separate from G
}

export const LiquidGlassFilter: React.FC<LiquidGlassFilterProps> = ({
  id,
  mapUrl,
  scale,
  chromaticDelta = 0,
}) => {
  if (!mapUrl) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <defs>
        <filter
          id={id}
          filterUnits="objectBoundingBox"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          {/* Load the Gradient Map */}
          <feImage
            result="map"
            href={mapUrl}
            preserveAspectRatio="none"
          />

          {/* 
             DISPLACEMENT STAGE 
             We perform 3 displacements for RGB Split (Chromatic Aberration)
          */}
          
          {/* RED Channel Displacement (Shifted +) */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale + chromaticDelta}
            xChannelSelector="R"
            yChannelSelector="B"
            result="dispR"
          />

          {/* GREEN Channel Displacement (Base Scale) */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="B"
            result="dispG"
          />

          {/* BLUE Channel Displacement (Shifted -) */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale - chromaticDelta}
            xChannelSelector="R"
            yChannelSelector="B"
            result="dispB"
          />

          {/* 
             RECOMBINATION STAGE
             We need to isolate the respective color channel from each displacement result
             and merge them.
          */}

          {/* Isolate Red from dispR */}
          <feComponentTransfer in="dispR" result="R_Ch">
            <feFuncR type="identity" />
            <feFuncG type="discrete" tableValues="0" />
            <feFuncB type="discrete" tableValues="0" />
            <feFuncA type="identity" /> 
          </feComponentTransfer>

          {/* Isolate Green from dispG */}
          <feComponentTransfer in="dispG" result="G_Ch">
            <feFuncR type="discrete" tableValues="0" />
            <feFuncG type="identity" />
            <feFuncB type="discrete" tableValues="0" />
            <feFuncA type="identity" />
          </feComponentTransfer>

          {/* Isolate Blue from dispB */}
          <feComponentTransfer in="dispB" result="B_Ch">
            <feFuncR type="discrete" tableValues="0" />
            <feFuncG type="discrete" tableValues="0" />
            <feFuncB type="identity" />
            <feFuncA type="identity" />
          </feComponentTransfer>

          {/* 
             MERGE
             Using 'screen' or 'lighten' to blend them back. 
             'screen' is standard for additive light, but can wash out if not careful.
             'lighten' (max) handles overlap well for solid colors.
             Actually, pure addition isn't quite right for opaque pixels, 
             but for this effect it creates the 'fringing' look.
          */}
          <feComposite operator="add" in="R_Ch" in2="G_Ch" result="RG" />
          <feComposite operator="add" in="RG" in2="B_Ch" result="final" />

        </filter>
      </defs>
    </svg>
  );
};
