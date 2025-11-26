
export type GlassShapeProfile = 'convex' | 'concave' | 'flat' | 'liquid';
export type GlassShape = 'rect' | 'squircle';

interface GlassMaps {
  surfaceUrl: string; // Packed: R=NormX, G=NormY, B=Height, A=Mask
}

/**
 * 5-Stage Hydro-Physical Glass Map Generator
 * ------------------------------------------
 * Now supports 'rect' (Rounded Box) and 'squircle' (Superellipse).
 */
export function generateGlassMaps(
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

      let dist = 0;

      // STAGE 2: Apply Liquid Turbulence
      let tx = x;
      let ty = y;
      if (warp > 0 || isLiquid) {
         const n = noise2d(x * warpScale, y * warpScale);
         tx += n * warpAmp;
         ty += n * warpAmp;
      }

      if (shape === 'squircle') {
          // Squircle SDF Approximation (Superellipse n=4)
          // |x/a|^4 + |y/b|^4 = 1
          const nx = (tx - cx) / (width / 2);
          const ny = (ty - cy) / (height / 2);
          const val = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);
          
          // Approx distance from edge: (v^0.25 - 1) * radius_scale
          // This gives 0 at edge, positive outside, negative inside.
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
  // Softens the shape to simulate surface tension
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
      
      // Calculate Normals (Sobel Kernel approximation)
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

      // STAGE 5: Packing Channels
      // R: Normal X (0-255) -> Refraction Horizontal
      // G: Normal Y (0-255) -> Refraction Vertical
      // B: Height (0-255)   -> Specular Lighting Surface
      // A: Mask (255)       -> Opacity
      
      // MAPPING EXPLANATION:
      // Normal X ranges from -1 to 1. 
      // We map -1 to 0, 0 to 128, 1 to 255.
      // 128 (0x80) represents "No Slope" / "Flat" / "No Displacement".
      data[i] = (nx * 0.5 + 0.5) * 255;     // R
      data[i + 1] = (ny * 0.5 + 0.5) * 255; // G
      data[i + 2] = hVal * 255;             // B
      data[i + 3] = hVal > 0.01 ? 255 : 0;  // A (Hard Mask based on height)
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return { surfaceUrl: canvas.toDataURL('image/png') };
}
