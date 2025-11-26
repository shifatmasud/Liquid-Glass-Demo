
/**
 * Generates an SVG Gradient Map for feDisplacementMap
 * Based on the Liquid Glass demo technique.
 */
export function generateGlassMaps(
  width: number,
  height: number,
  radius: number | [number, number, number, number],
  bezel: number,
  blur: number = 10,
  fillProfile: 'convex' | 'concave' = 'convex'
): string {
  if (width === 0 || height === 0) return '';

  // Safe bezel calculation
  const safeBezel = Math.min(bezel, Math.min(width, height) / 2);
  const innerWidth = Math.max(0, width - safeBezel * 2);
  const innerHeight = Math.max(0, height - safeBezel * 2);

  // Parse Radii
  // If number: [r, r, r, r]
  // If array: [tl, tr, br, bl]
  const radii: [number, number, number, number] = Array.isArray(radius) 
    ? radius 
    : [radius, radius, radius, radius];

  // Helper to generate a path for a rounded rectangle (or variable corners)
  const createPath = (x: number, y: number, w: number, h: number, r: [number, number, number, number]) => {
    // Clamp radii to not exceed dimensions
    const maxR = Math.min(w/2, h/2);
    const [tl, tr, br, bl] = r.map(val => Math.min(val, maxR));
    
    // Ensure we handle 0 radius gracefully (A 0,0 is a line)
    return `
      M ${x + tl},${y}
      L ${x + w - tr},${y}
      A ${tr},${tr} 0 0 1 ${x + w},${y + tr}
      L ${x + w},${y + h - br}
      A ${br},${br} 0 0 1 ${x + w - br},${y + h}
      L ${x + bl},${y + h}
      A ${bl},${bl} 0 0 1 ${x},${y + h - bl}
      L ${x},${y + tl}
      A ${tl},${tl} 0 0 1 ${x + tl},${y}
      Z
    `.replace(/\s+/g, ' ').trim();
  };

  // Outer Path (Full Size)
  const outerPath = createPath(0, 0, width, height, radii);

  // Inner Path (Inset by bezel)
  // We reduce the inner radii to match the "slope" logic: innerR = max(0, R - offset)
  const innerRadii = radii.map(r => Math.max(0, r - safeBezel / 2)) as [number, number, number, number];
  const innerPath = createPath(safeBezel, safeBezel, innerWidth, innerHeight, innerRadii);

  // SVG Content
  // 1. Black BG (Base 0,0,0) -> R=0(X-0.5), G=0(Y-0.5), B=0(Low)
  // 2. Red Gradient (Horizontal X displacement 0->1)
  // 3. Green Gradient (Vertical Y displacement 0->1)
  // 4. Inner Fill (Neutral Displacement, High Height)
  //    Old: #808080 (R=128, G=128, B=128). B=0.5 height.
  //    New: #8080FF (R=128, G=128, B=255). B=1.0 height.
  //    This gives us a full 0->1 height range in the Blue channel for lighting.
  
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="gradX" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#000" />
        <stop offset="100%" stop-color="#f00" />
      </linearGradient>
      <linearGradient id="gradY" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000" />
        <stop offset="100%" stop-color="#0f0" />
      </linearGradient>
    </defs>
    
    <!-- Base: Black -->
    <path d="${outerPath}" fill="#000" />
    
    <!-- X Displacement (Red) -->
    <path d="${outerPath}" fill="url(#gradX)" style="mix-blend-mode: screen;" />
    
    <!-- Y Displacement (Green) -->
    <path d="${outerPath}" fill="url(#gradY)" style="mix-blend-mode: screen;" />
    
    <!-- Inner Neutral Mask & Height Map -->
    <!-- R=0.5 (No X Disp), G=0.5 (No Y Disp), B=1.0 (Max Height) -->
    <!-- We blur this to create the smooth slope in the Blue channel -->
    <g style="filter: blur(${blur}px);">
        <path d="${innerPath}" fill="#8080FF" />
    </g>
  </svg>
  `.trim();

  // Encode SVG
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
