import React from 'react';
import { Canvas, RoundedRect, Shadow, Group } from '@shopify/react-native-skia';
import { useColors, RADII, getShadows } from '../../theme/skiaTheme';

interface SkiaCardProps {
  width: number;
  height: number;
  radius?: number;
  color?: string;
  elevated?: boolean;
  glowColor?: string;
  children?: React.ReactNode;
}

export function SkiaCard({
  width,
  height,
  radius = RADII.lg,
  color: colorProp,
  elevated = false,
  glowColor,
  children,
}: SkiaCardProps) {
  const COLORS = useColors();
  const SHADOWS = getShadows(COLORS);
  const color = colorProp ?? COLORS.surface;
  const shadow = elevated ? SHADOWS.elevated : SHADOWS.card;

  return (
    <Canvas style={{ width, height }}>
      <Group>
        {/* Background */}
        <RoundedRect x={0} y={0} width={width} height={height} r={radius} color={color} />
        {/* Shadow — drawn behind by rendering order */}
        <Shadow dx={shadow.dx} dy={shadow.dy} blur={shadow.blur} color={shadow.color} />
        <RoundedRect x={0} y={0} width={width} height={height} r={radius} color={color} />
        {/* Glow border */}
        {glowColor && (
          <>
            <Shadow dx={0} dy={0} blur={16} color={glowColor} />
            <RoundedRect x={1} y={1} width={width - 2} height={height - 2} r={radius} color="transparent" />
          </>
        )}
      </Group>
      {children}
    </Canvas>
  );
}
