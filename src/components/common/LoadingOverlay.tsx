import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColors, RADII } from '../../theme/skiaTheme';

interface LoadingOverlayProps {
  message?: string;
  visible?: boolean;
}

export function LoadingOverlay({ message = 'Loading...', visible = true }: LoadingOverlayProps) {
  const COLORS = useColors();

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
      backgroundColor: COLORS.overlay, alignItems: 'center', justifyContent: 'center', zIndex: 999,
    },
    card: {
      backgroundColor: COLORS.surfaceElevated, borderRadius: RADII.lg, padding: 32,
      alignItems: 'center', gap: 16,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
    },
    message: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  }), [COLORS]);

  if (!visible) return null;
  return (
    <View style={styles.overlay} accessibilityRole="progressbar" accessibilityLabel={message}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}
