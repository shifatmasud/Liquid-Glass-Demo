/**
 * Generates an SVG Gradient Map for feDisplacementMap.
 * 
 * CORE TECHNOLOGY:
 * This function creates a data URL representing an SVG image.
 * The SVG contains strictly defined gradients for X and Y displacement.
 * 
 * MAP KEY:
 * Red Channel (R): X Displacement
 *   0   (Black) -> Moves Left (Negative scale)
 *   128 (Grey)  -> No Move (0)
 *   255 (Red)   -> Moves Right (Positive scale)
 * 
 * Green Channel (G): Y Displacement
 *   0   (Black) -> Moves Up (Negative scale)
 *   128 (Grey)  -> No Move (0)
 *   255 (Green) -> Moves Down (Positive scale)
 */
export function generateDisplacementMap(
  width: number,
  height: number,
  radius: number,
  bezel: number,
): string {
  if (width <= 0 || height <= 0) return '';

  // Clamp values for safety
  const safeRadius = Math.min(radius, Math.min(width, height) / 2);
  const safeBezel = Math.min(bezel, Math.min(width, height) / 2);
  
  // The inner shape defines the flat, non-distorted area
  const innerWidth = Math.max(0, width - safeBezel * 2);
  const innerHeight = Math.max(0, height - safeBezel * 2);
  const innerRadius = Math.max(0, safeRadius - safeBezel / 2);

  // Blur amount creates the "slope" or curve of the glass edge
  const blurStdDev = Math.max(2, safeBezel / 2.5);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <!-- X-Axis Gradient: Black (0) to Red (255) -->
      <linearGradient id="gradX" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#000000" />
        <stop offset="100%" stop-color="#ff0000" />
      </linearGradient>
      
      <!-- Y-Axis Gradient: Black (0) to Green (255) -->
      <linearGradient id="gradY" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" />
        <stop offset="100%" stop-color="#00ff00" />
      </linearGradient>

      <!-- Blur Filter for the internal neutral mask -->
      <filter id="blurFilter">
        <feGaussianBlur stdDeviation="${blurStdDev}" />
      </filter>
    </defs>
    
    <!-- 1. Background Fill: Neutral Grey (128,128,128) -->
    <!-- This ensures that any transparent gaps are treated as "no displacement" -->
    <rect width="100%" height="100%" fill="#808080" />

    <!-- 2. Additive Gradients -->
    <!-- We use 'screen' blend mode. 
         Screening #000 (0) with anything changes nothing.
         Screening #F00 with #0F0 results in #FF0 (Yellow).
         It basically adds the light values.
    -->
    <g style="mix-blend-mode: screen;">
        <!-- X Gradient -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#gradX)" rx="${safeRadius}" />
        <!-- Y Gradient -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#gradY)" rx="${safeRadius}" style="mix-blend-mode: screen;" />
    </g>
    
    <!-- 3. Inner Neutral Mask -->
    <!-- We overlay a solid Neutral Grey (#808080) box in the center. -->
    <!-- This "cancels out" the gradient in the middle, creating a flat viewing area. -->
    <!-- The blur creates the smooth transition from the gradient edge to the flat center. -->
    <g filter="url(#blurFilter)">
      <rect 
        x="${safeBezel}" 
        y="${safeBezel}" 
        width="${innerWidth}" 
        height="${innerHeight}" 
        fill="#808080" 
        rx="${innerRadius}"
      />
    </g>
  </svg>
  `.trim().replace(/>\s+</g, '><'); // Minimal cleaning

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}