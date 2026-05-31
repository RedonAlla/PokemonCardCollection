import React, { useMemo } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  useImage,
  Image,
} from '@shopify/react-native-skia';
import type { TCGdexCardSearchResult } from '../../types/api';
import { GRID_COLUMNS, GRID_SPACING } from '../../utils/constants';
import { useColors, RADII } from '../../theme/skiaTheme';
import { backCard } from '../../utils/images';

interface SearchResultsGridProps {
  results: TCGdexCardSearchResult[];
  onCardPress: (card: TCGdexCardSearchResult) => void;
}

interface CardViewProps {
  image?: string | null;
  width: number;
  height: number;
}

function getImageUrl(image?: string | null) {
  return image ? `${image}/high.webp` : null;
}

function CardView({ image, width, height }: CardViewProps) {
  const imageUrl = useImage(getImageUrl(image) ?? backCard);

  if(!imageUrl) return null;

  return (
    <Canvas style={{ width: width, height: height }}>
      <Image
        image={imageUrl}
        height={height}
        width={width}
        fit="cover"
      />
    </Canvas>
  );
}

export function SearchResultsGrid({ results, onCardPress }: SearchResultsGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const COLORS = useColors();
  const cardWidth = (screenWidth - 16 - GRID_SPACING * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const cardHeight = cardWidth * 1.4;

  const styles = useMemo(() => StyleSheet.create({
    contentContainer: { paddingHorizontal: 8, paddingBottom: 16 },
    columnWrapper: { gap: GRID_SPACING, marginBottom: GRID_SPACING },
    cardContainer: { borderRadius: RADII.sm, overflow: 'hidden', backgroundColor: COLORS.surface },
    cardImage: { borderRadius: RADII.sm },
    noImagePlaceholder: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: COLORS.surfaceElevated, borderRadius: RADII.sm,
      justifyContent: 'center', alignItems: 'center',
    },
    noImageText: { fontSize: 28, fontWeight: '700', color: COLORS.textMuted },
  }), [COLORS]);

  const renderItem = ({ item }: { item: TCGdexCardSearchResult }) => {
    return (
      <TouchableOpacity
        style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}
        onPress={() => onCardPress(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Card: ${item.name}`}
      >
        <CardView image={item.image} height={cardHeight} width={cardWidth} />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}
