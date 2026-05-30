import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  Text as SkiaText,
  Shadow,
} from '@shopify/react-native-skia';
import { COLORS, GRADIENTS, RADII } from '../../theme/skiaTheme';
import { useSkiaFonts } from './SkiaText';

interface SkiaButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const SIZE_MAP = {
  small: { h: 36, px: 16, fontSize: 14 },
  medium: { h: 48, px: 24, fontSize: 16 },
  large: { h: 56, px: 32, fontSize: 18 },
} as const;

const VARIANT_GRADIENT: Record<string, readonly [string, string]> = {
  primary: [COLORS.gold, COLORS.electricBlue],
  secondary: [COLORS.surface, COLORS.surfaceElevated],
  danger: ['#E57373', '#C62828'],
};

const VARIANT_TEXT_COLOR: Record<string, string> = {
  primary: COLORS.textPrimary,
  secondary: COLORS.gold,
  danger: COLORS.textPrimary,
};

export function SkiaButton({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
}: SkiaButtonProps) {
  const { bold, ready } = useSkiaFonts();
  const { h, fontSize } = SIZE_MAP[size];
  const [width, setWidth] = useState(120);
  const gradientColors = VARIANT_GRADIENT[variant];
  const textColor = VARIANT_TEXT_COLOR[variant];
  const isDisabled = disabled || loading || !ready;

  const textWidth = label.length * fontSize * 0.55;
  const textX = width / 2 - textWidth / 2;
  const textY = h / 2 + fontSize * 0.35;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={fullWidth ? styles.fullWidth : undefined}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setWidth(w);
      }}
    >
      <View style={{ height: h, opacity: isDisabled ? 0.4 : 1 }}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Shadow dx={0} dy={2} blur={8} color="rgba(0,0,0,0.3)" />
          <RoundedRect x={0} y={0} width={width} height={h} r={RADII.md} color={COLORS.surface}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: width, y: 0 }}
              colors={gradientColors as [string, string]}
            />
          </RoundedRect>
          {bold && (
            <SkiaText
              text={loading ? '...' : label}
              x={textX}
              y={textY}
              font={bold}
              color={textColor}
            />
          )}
        </Canvas>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
});
