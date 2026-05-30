import React from 'react';
import { Canvas, RoundedRect, LinearGradient, Shadow } from '@shopify/react-native-skia';
import { COLORS, RADII } from '../../theme/skiaTheme';

interface SkiaGradientBorderProps {
  width: number;
  height: number;
  radius?: number;
  strokeWidth?: number;
  colors?: readonly [string, string];
  glow?: boolean;
}

export function SkiaGradientBorder({
  width,
  height,
  radius = RADII.md,
  strokeWidth = 2,
  colors = [COLORS.gold, COLORS.electricBlue],
  glow = false,
}: SkiaGradientBorderProps) {
  return (
    <Canvas style={{ width, height }}>
      {glow && <Shadow dx={0} dy={0} blur={12} color={COLORS.electricBlue} />}
      <RoundedRect
        x={strokeWidth / 2}
        y={strokeWidth / 2}
        width={width - strokeWidth}
        height={height - strokeWidth}
        r={radius}
        color={COLORS.surface}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: width, y: height }}
          colors={colors as [string, string]}
        />
      </RoundedRect>
    </Canvas>
  );
}
