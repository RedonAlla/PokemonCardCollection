import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColors, RADII } from '../../theme/skiaTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const COLORS = useColors();
  const isDisabled = disabled || loading;

  const styles = useMemo(() => StyleSheet.create({
    base: {
      borderRadius: RADII.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    primary: { backgroundColor: COLORS.gold },
    secondary: {
      backgroundColor: COLORS.surfaceElevated,
      borderWidth: 1,
      borderColor: COLORS.white15,
    },
    danger: { backgroundColor: COLORS.danger },
    size_small: { paddingHorizontal: 16, paddingVertical: 8 },
    size_medium: { paddingHorizontal: 24, paddingVertical: 12 },
    size_large: { paddingHorizontal: 32, paddingVertical: 16 },
    fullWidth: { width: '100%' },
    disabled: { opacity: 0.5 },
    text: { fontWeight: '600' },
    text_primary: { color: COLORS.background },
    text_secondary: { color: COLORS.gold },
    text_danger: { color: '#FFFFFF' },
    textSize_small: { fontSize: 14 },
    textSize_medium: { fontSize: 16 },
    textSize_large: { fontSize: 18 },
  }), [COLORS]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.gold : COLORS.textSecondary} size="small" />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
