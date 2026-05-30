import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Canvas, RoundedRect, Shadow } from '@shopify/react-native-skia';
import { ChildAvatar } from './ChildAvatar';
import { COLORS, RADII, SHADOWS } from '../../theme/skiaTheme';
import type { ChildWithCount } from '../../types/database';

interface ChildProfileCardProps {
  child: ChildWithCount;
  onPress: () => void;
}

export function ChildProfileCard({ child, onPress }: ChildProfileCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 32;
  const cardHeight = 100;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${child.name}, ${child.card_count} cards`}
      style={styles.touchable}
    >
      <View style={[styles.cardContainer, { height: cardHeight }]}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Shadow dx={SHADOWS.card.dx} dy={SHADOWS.card.dy} blur={SHADOWS.card.blur} color={SHADOWS.card.color} />
          <RoundedRect x={0} y={0} width={cardWidth} height={cardHeight} r={RADII.lg} color={COLORS.surface} />
        </Canvas>
        <View style={styles.content}>
          <ChildAvatar name={child.name} color={child.color} size={52} />
          <View style={styles.textContainer}>
            <Text style={styles.name} numberOfLines={1}>{child.name}</Text>
            <Text style={styles.cardCount}>
              {child.card_count} {child.card_count === 1 ? 'card' : 'cards'}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: { marginHorizontal: 16, marginVertical: 6 },
  cardContainer: { borderRadius: RADII.lg, overflow: 'hidden' },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  textContainer: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  cardCount: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  chevron: { fontSize: 28, color: COLORS.textMuted, fontWeight: '300', marginLeft: 8 },
});
