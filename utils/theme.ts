
// Tier 2: Design System - JS Object Format
export const Theme = {
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
      Accent: {
        Surface: '#FFFFFF',
        Content: '#000000',
      }
    },
  },
  Type: {
    Expressive: {
      Display: {
        L: { fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(4rem, 8vw, 8rem)', lineHeight: 0.9, letterSpacing: '-0.02em' },
        M: { fontFamily: '"Bebas Neue", sans-serif', fontSize: '3rem', lineHeight: 1 },
      },
      Quote: {
        M: { fontFamily: '"Comic Neue", cursive', fontSize: '1.25rem', lineHeight: 1.5, fontWeight: 700 }
      }
    },
    Readable: {
      Body: {
        M: { fontFamily: '"Inter", sans-serif', fontSize: '16px', lineHeight: 1.6, fontWeight: 400 },
        S: { fontFamily: '"Inter", sans-serif', fontSize: '14px', lineHeight: 1.5, fontWeight: 400 },
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
    XXL: 80,
  },
  Radius: {
    S: 8,
    M: 16,
    L: 24,
    Full: 9999,
  },
  Effect: {
    Blur: {
      S: '4px',
      M: '12px',
      L: '20px',
    },
    Shadow: {
      Drop: {
        1: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        2: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
        3: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  Time: {
    Base: 100, // ms
    Short: 150, // Base + 50
    Medium: 300, // Base * 3
    Long: 500, // Base * 5
  }
};