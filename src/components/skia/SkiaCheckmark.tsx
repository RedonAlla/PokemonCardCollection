import React, { useEffect } from 'react';
import { Canvas, Path } from '@shopify/react-native-skia';
import { useSharedValue, withTiming } from 'react-native-reanimated';

interface SkiaCheckmarkProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function SkiaCheckmark({
  size = 24,
  color = '#34C759',
  strokeWidth = 3,
}: SkiaCheckmarkProps) {
  const end = useSharedValue(0);

  useEffect(() => {
    end.value = withTiming(1, { duration: 400 });
  }, [end]);

  const pad = strokeWidth;
  const path = `M ${pad + size * 0.15} ${pad + size * 0.5} L ${pad + size * 0.4} ${pad + size * 0.75} L ${pad + size * 0.85} ${pad + size * 0.2}`;

  return (
    <Canvas style={{ width: size, height: size }}>
      <Path
        path={path}
        color={color}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
        strokeJoin="round"
        end={end}
      />
    </Canvas>
  );
}
