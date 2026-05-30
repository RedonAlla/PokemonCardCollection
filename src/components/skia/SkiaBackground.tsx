import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle, Path, Group } from '@shopify/react-native-skia';
import { COLORS } from '../../theme/skiaTheme';

function PokeballSilhouette({ x, y, radius, rotation, opacity }: {
  x: number; y: number; radius: number; rotation: number; opacity: number;
}) {
  const cx = x;
  const cy = y;
  const linePath = `M ${cx - radius} ${cy} L ${cx + radius} ${cy}`;

  return (
    <Group opacity={opacity} transform={[{ rotate: (rotation * Math.PI) / 180 }]} origin={{ x: cx, y: cy }}>
      <Circle cx={cx} cy={cy} r={radius} color={COLORS.white05} style="stroke" strokeWidth={1} />
      <Path path={linePath} color={COLORS.white05} style="stroke" strokeWidth={1} />
      <Circle cx={cx} cy={cy} r={radius * 0.15} color={COLORS.white05} />
    </Group>
  );
}

interface SkiaBackgroundProps {
  width: number;
  height: number;
  showPokeballs?: boolean;
}

export function SkiaBackground({ width, height, showPokeballs = false }: SkiaBackgroundProps) {
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {showPokeballs && (
        <>
          <PokeballSilhouette x={width * 0.15} y={height * 0.2} radius={80} rotation={15} opacity={0.04} />
          <PokeballSilhouette x={width * 0.75} y={height * 0.55} radius={120} rotation={-10} opacity={0.04} />
          <PokeballSilhouette x={width * 0.5} y={height * 0.85} radius={90} rotation={25} opacity={0.03} />
        </>
      )}
    </Canvas>
  );
}
