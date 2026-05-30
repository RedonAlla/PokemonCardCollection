import React from 'react';
import {
  Canvas,
  RadialGradient,
  vec,
  useImage,
  Image,
  LinearGradient,
  Group,
  RoundedRect,
} from '@shopify/react-native-skia';

interface CardImageCanvasProps {
  width: number;
  height: number;
  imageUrl: string | null;
  gradientCenter: {x: number; y: number};
}

export function CardImageCanvas({width, height, imageUrl, gradientCenter}: CardImageCanvasProps) {

  const skiaImage = useImage(imageUrl ?? '');

  if (!skiaImage) {
    return null;
  }

  function glareShinyLayer() {
    return (
      <Group blendMode={'overlay'}>
        {/* Combined effect using a gradient */}
        <RoundedRect x={0} y={0} r={17} width={width} height={height}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: width, y: height}}
            colors={[
              'rgba(255, 255, 255, 0.15)', // Simulates brightness
              'rgba(0, 0, 0, 0.25)', // Simulates contrast
              'rgba(128, 128, 128, 0.2)', // Simulates saturation
            ]}
          />
        </RoundedRect>
        <RoundedRect
          x={0}
          y={0}
          width={width}
          r={17}
          height={height}
          color="white">
          <RadialGradient
            c={vec(gradientCenter.x, gradientCenter.y)}
            r={Math.max(width, height)}
            colors={[
              'hsla(0, 0%, 100%, 0.8)',
              'hsla(0, 0%, 100%, 0.65)',
              'hsla(0, 0%, 0%, 0.5)',
            ]}
            positions={[0.1, 0.2, 0.9]}
          />
        </RoundedRect>
      </Group>
    );
  }

  return (
    <Canvas style={{width, height}}>
      <Image image={skiaImage} height={height} width={width} fit="cover" />     
      {glareShinyLayer()}
    </Canvas>
  );
}