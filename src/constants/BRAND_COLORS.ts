export const BRAND_COLORS = {
  PRIMARY: {
    PINK: '#FF6B9D',
    BLUE: '#4ECDC4',
  },
  BACKGROUND: '#0a0a0a',
  SURFACE: 'rgba(255, 255, 255, 0.05)',
  TEXT: {
    PRIMARY: '#ffffff',
    SECONDARY: '#a0a0a0',
  },
  ACCENT: '#FF6B9D',
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
} as const;

export const GRADIENTS = {
  PRIMARY: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
  PRIMARY_HOVER: 'linear-gradient(135deg, #FF6B9D 10%, #4ECDC4 90%)',
  TEXT: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
} as const;

export const TYPOGRAPHY = {
  HEADING_XL: '4rem',
  HEADING_L: '3rem', 
  HEADING_M: '2rem',
  BODY_L: '1.25rem',
  BODY_M: '1rem',
  BODY_S: '0.875rem',
} as const;

export const SPACING = {
  XS: '0.25rem',
  SM: '0.5rem',
  MD: '1rem',
  LG: '1.5rem',
  XL: '2rem',
  '2XL': '3rem',
  '3XL': '4rem',
} as const;

export const ANIMATION_TIMINGS = {
  FAST: '150ms',
  MEDIUM: '300ms',
  SLOW: '500ms',
  EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
} as const;