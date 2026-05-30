import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Canvas, RoundedRect, Shadow, Text as SkiaText, BackdropFilter, Blur } from '@shopify/react-native-skia';
import { useColors, RADII } from '../../theme/skiaTheme';
import { useSkiaFonts } from './SkiaText';

interface SkiaBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /**
   * Maximum height as a fraction of screen height (0–1). Default 0.65.
   */
  maxHeightFraction?: number;
}

export function SkiaBottomSheet({
  visible,
  onClose,
  title,
  children,
  maxHeightFraction = 0.65,
}: SkiaBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { bold } = useSkiaFonts();
  const COLORS = useColors();

  const sheetHeight = screenHeight * maxHeightFraction;
  const handleWidth = 36;
  const handleHeight = 5;
  const handleY = 12;

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: COLORS.overlay,
      justifyContent: 'flex-end',
    },
    sheetContainer: {
      width: '100%',
      borderTopLeftRadius: RADII.xl,
      borderTopRightRadius: RADII.xl,
      overflow: 'visible',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
  }), [COLORS]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Tappable backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <View
          style={[
            styles.sheetContainer,
            {
              height: sheetHeight,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {/* Skia sheet background with frosted effect hint */}
          <Canvas style={StyleSheet.absoluteFill}>
            <Shadow dx={0} dy={-4} blur={20} color="rgba(0,0,0,0.5)" />
            <RoundedRect
              x={0}
              y={0}
              width={screenWidth}
              height={sheetHeight}
              r={RADII.xl}
              color={COLORS.surface}
            />
            {/* Drag handle pill */}
            <RoundedRect
              x={screenWidth / 2 - handleWidth / 2}
              y={handleY}
              width={handleWidth}
              height={handleHeight}
              r={handleHeight / 2}
              color={COLORS.textMuted}
            />
            {/* Title */}
            {title && bold && (
              <SkiaText
                text={title}
                x={screenWidth / 2 - title.length * 10}
                y={handleY + 30}
                font={bold}
                color={COLORS.textPrimary}
              />
            )}
          </Canvas>

          {/* Content */}
          <View style={[styles.content, { paddingTop: title ? 56 : 36 }]}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}
