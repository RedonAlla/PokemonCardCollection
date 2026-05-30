import React from 'react';
import { Canvas, Circle, Text as SkiaText } from '@shopify/react-native-skia';
import { getInitials } from '../../utils/colors';
import { useSkiaFonts } from './SkiaText';

interface SkiaAvatarProps {
  name: string;
  color: string;
  size?: number;
  x?: number;
  y?: number;
}

export function SkiaAvatar({ name, color, size = 48, x, y }: SkiaAvatarProps) {
  const { bold } = useSkiaFonts();
  const radius = size / 2;
  const cx = (x ?? 0) + radius;
  const cy = (y ?? 0) + radius;
  const initials = getInitials(name);
  const fontSize = size * 0.38;

  if (!bold) return null;

  const textWidth = initials.length * fontSize * 0.6;
  const textX = cx - textWidth / 2;
  const textY = cy + fontSize * 0.35;

  return (
    <Canvas style={{ width: size, height: size, position: 'absolute', left: x ?? 0, top: y ?? 0 }}>
      <Circle cx={cx} cy={cy} r={radius} color={color} />
      <SkiaText
        text={initials}
        x={textX}
        y={textY}
        font={bold}
        color="#FFFFFF"
      />
    </Canvas>
  );
}
