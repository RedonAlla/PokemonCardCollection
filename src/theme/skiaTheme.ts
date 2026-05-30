export const COLORS = {
  background: '#0D0D1A',
  surface: '#16162B',
  surfaceElevated: '#1E1E3A',
  gold: '#FFD700',
  goldLight: '#FFE44D',
  electricBlue: '#00B4FF',
  electricBlueDark: '#0088CC',
  textPrimary: '#FFFFFF',
  textSecondary: '#8899AA',
  textMuted: '#556677',
  success: '#34C759',
  danger: '#FB2C36',
  overlay: 'rgba(0, 0, 0, 0.75)',
  white05: 'rgba(255, 255, 255, 0.05)',
  white10: 'rgba(255, 255, 255, 0.1)',
  white15: 'rgba(255, 255, 255, 0.15)',
} as const;

export const GRADIENTS: Record<string, [string, string]> = {
  goldToBlue: [COLORS.gold, COLORS.electricBlue],
  blueToGold: [COLORS.electricBlue, COLORS.gold],
  surfaceToElevated: [COLORS.surface, COLORS.surfaceElevated],
  dangerGradient: ['#E57373', '#C62828'],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT_SIZES = {
  caption: 12,
  body: 14,
  bodyLarge: 16,
  subtitle: 18,
  title: 22,
  h2: 28,
  h1: 36,
} as const;

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
} as const;

export const SHADOWS = {
  card: {
    dx: 0,
    dy: 4,
    blur: 12,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  elevated: {
    dx: 0,
    dy: 8,
    blur: 24,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  glow: (color: string = COLORS.electricBlue) => ({
    dx: 0,
    dy: 0,
    blur: 20,
    color,
  }),
  textGlow: {
    dx: 0,
    dy: 0,
    blur: 8,
    color: COLORS.electricBlue,
  },
} as const;

export const ANIMATION = {
  spring: { damping: 15, stiffness: 150 },
  snappy: { damping: 20, stiffness: 200 },
  smooth: { duration: 300 },
  stagger: 50,
} as const;

export const GRID = {
  columns: 3,
  spacing: 8,
  cardAspectRatio: 1.4,
} as const;
