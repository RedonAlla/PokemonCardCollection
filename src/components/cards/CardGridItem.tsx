import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import type { CardWithDateAdded } from '../../types/database';
import { GRID_COLUMNS, GRID_SPACING } from '../../utils/constants';
import { useColors, RADII } from '../../theme/skiaTheme';

interface CardGridItemProps {
  card: CardWithDateAdded;
  index: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export function CardGridItem({ card, onPress, onLongPress }: CardGridItemProps) {
  const { width: screenWidth } = useWindowDimensions();
  const COLORS = useColors();
  const padding = GRID_SPACING * 2;
  const cardWidth = (screenWidth - padding - GRID_SPACING * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const cardHeight = cardWidth * 1.4;

  const styles = useMemo(() => StyleSheet.create({
    container: { borderRadius: RADII.sm, overflow: 'hidden', backgroundColor: COLORS.surface },
    image: { borderRadius: RADII.sm },
  }), [COLORS]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      delayLongPress={400}
      style={[styles.container, { width: cardWidth, height: cardHeight, marginBottom: GRID_SPACING }]}
      accessibilityRole="button"
      accessibilityLabel={`${card.name} from ${card.set_name}`}
    >
      <Image
        source={card.image_url}
        style={[styles.image, { width: cardWidth, height: cardHeight }]}
        contentFit="contain"
        transition={200}
      />
    </TouchableOpacity>
  );
}
