
import React from 'react';

interface GlassSVGDefinitionsProps {
  filterId: string;
  mapUrl: string;       // Data URL from generator
  lightPos: { x: number; y: number; z: number };
  refractionScale: number; // Intensity of displacement
  specularConstant: number; // Brightness of shine
  lightingIntensity: number; // Surface height for lighting
}

export const GlassSVGDefinitions: React.FC<GlassSVGDefinitionsProps> = ({
  filterId,
  mapUrl,
  lightPos,
  refractionScale,
  specularConstant,
  lightingIntensity,
}) => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        <filter 
          id={filterId} 
          x="-50%" 
          y="-50%" 
          width="200%" 
          height="200%" 
          colorInterpolationFilters="sRGB"
        >
          {/* STAGE 1: Load the Generated Map */}
          {/* Contains: R=NormX, G=NormY, B=Height */}
          <feImage 
            result="mapImage" 
            href={mapUrl} 
            preserveAspectRatio="none" 
          />

          {/* STAGE 1.5: Extract Height Map */}
          {/* Move Blue Channel (Height) to Alpha Channel for Lighting Filters */}
          <feColorMatrix 
            in="mapImage"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0" 
            result="heightMap"
          />

          {/* STAGE 2: Refraction (Displacement) */}
          {/* Warps the SourceGraphic based on Red/Green channels of map */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="mapImage"
            scale={refractionScale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />

          {/* STAGE 3: Specular Lighting (The Shine) */}
          {/* Uses the Alpha channel of heightMap */}
          <feSpecularLighting
            in="heightMap"
            surfaceScale={lightingIntensity}
            specularConstant={specularConstant}
            specularExponent="40"
            lightingColor="#ffffff"
            result="specular"
          >
            <fePointLight x={lightPos.x} y={lightPos.y} z={lightPos.z} />
          </feSpecularLighting>

          {/* STAGE 4: Diffuse Lighting (Volume/Shadow) */}
          {/* Adds depth to the opposite side of the light */}
          <feDiffuseLighting
            in="heightMap"
            surfaceScale={lightingIntensity / 2}
            diffuseConstant="0.5"
            lightingColor="#ffffff"
            result="diffuse"
          >
            <fePointLight x={lightPos.x} y={lightPos.y} z={lightPos.z} />
          </feDiffuseLighting>

          {/* Create Shadow from Diffuse (Invert) */}
          <feColorMatrix
            in="diffuse"
            type="matrix"
            values="-1 0 0 0 1
                    -1 0 0 0 1
                    -1 0 0 0 1
                     0 0 0 1 0" // Keep Alpha
            result="shadow"
          />

          {/* STAGE 5: Compositing */}
          {/* Composite Lighting ON TOP of Refracted Body */}
          
          {/* 1. Add Specular to Refracted Body */}
          <feComposite
            in="specular"
            in2="refracted"
            operator="arithmetic"
            k1="0" k2="1" k3="1" k4="0"
            result="litBody"
          />

          {/* 2. Add Shadows (Multiply) */}
          <feComposite
            in="shadow"
            in2="litBody"
            operator="arithmetic"
            k1="0" k2="1" k3="-0.6" k4="0" // Subtract shadow
            result="final"
          />
          
          {/* 3. Final Edge Masking (Ensure strict shape bounds) */}
          {/* Use heightMap alpha to clip */}
          <feComposite
            in="final"
            in2="heightMap"
            operator="in"
          />

        </filter>
      </defs>
    </svg>
  );
};
