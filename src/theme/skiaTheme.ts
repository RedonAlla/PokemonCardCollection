import { useMemo } from 'react';
import { useThemeStore } from '../store/useThemeStore';

// ---------------------------------------------------------------------------
// Static tokens (do not change with theme)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Color palettes
// ---------------------------------------------------------------------------

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  gold: string;
  goldLight: string;
  electricBlue: string;
  electricBlueDark: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  danger: string;
  overlay: string;
  white05: string;
  white10: string;
  white15: string;
}

const darkColors: ColorPalette = {
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
};

const lightColors: ColorPalette = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#F9F9FB',
  gold: '#C8A200',
  goldLight: '#E6C000',
  electricBlue: '#0077B3',
  electricBlueDark: '#005C8A',
  textPrimary: '#1A1A2E',
  textSecondary: '#5A6A7E',
  textMuted: '#8E9AA8',
  success: '#248A3D',
  danger: '#D32F2F',
  overlay: 'rgba(0, 0, 0, 0.5)',
  white05: 'rgba(0, 0, 0, 0.05)',
  white10: 'rgba(0, 0, 0, 0.08)',
  white15: 'rgba(0, 0, 0, 0.12)',
};

const palettes: Record<string, ColorPalette> = {
  dark: darkColors,
  light: lightColors,
};

// ---------------------------------------------------------------------------
// Hook — reactive colour palette
// ---------------------------------------------------------------------------

/** Returns the current theme's colour palette. Re-renders on theme change. */
export function useColors(): ColorPalette {
  const mode = useThemeStore((s) => s.mode);
  return useMemo(() => palettes[mode], [mode]);
}

/** Returns the current theme mode string ('dark' | 'light'). */
export function useThemeMode() {
  return useThemeStore((s) => s.mode);
}

// ---------------------------------------------------------------------------
// Legacy static export (defaults to dark for backward compat)
// ---------------------------------------------------------------------------

/** @deprecated Use `useColors()` instead for reactive theming. */
export const COLORS: ColorPalette = darkColors;

// ---------------------------------------------------------------------------
// Derived gradient helpers
// ---------------------------------------------------------------------------

export function getGradients(c: ColorPalette) {
  return {
    goldToBlue: [c.gold, c.electricBlue] as [string, string],
    blueToGold: [c.electricBlue, c.gold] as [string, string],
    surfaceToElevated: [c.surface, c.surfaceElevated] as [string, string],
    dangerGradient: ['#E57373', '#C62828'] as [string, string],
  };
}

/** @deprecated Use `getGradients(useColors())` instead. */
export const GRADIENTS: Record<string, [string, string]> = getGradients(darkColors);

// ---------------------------------------------------------------------------
// Shadow helpers
// ---------------------------------------------------------------------------

export function getShadows(c: ColorPalette) {
  return {
    card: {
      dx: 0,
      dy: 4,
      blur: 12,
      color: 'rgba(0, 0, 0, 0.25)',
    },
    elevated: {
      dx: 0,
      dy: 8,
      blur: 24,
      color: 'rgba(0, 0, 0, 0.35)',
    },
    glow: (color: string = c.electricBlue) => ({
      dx: 0,
      dy: 0,
      blur: 20,
      color,
    }),
    textGlow: {
      dx: 0,
      dy: 0,
      blur: 8,
      color: c.electricBlue,
    },
  };
}

/** @deprecated Use `getShadows(useColors())` instead. */
export const SHADOWS = getShadows(darkColors);
