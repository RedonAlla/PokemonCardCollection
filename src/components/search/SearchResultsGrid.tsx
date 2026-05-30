import React, { useMemo } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import type { TCGdexCardSearchResult } from '../../types/api';
import { GRID_COLUMNS, GRID_SPACING } from '../../utils/constants';
import { useColors, RADII } from '../../theme/skiaTheme';

interface SearchResultsGridProps {
  results: TCGdexCardSearchResult[];
  onCardPress: (card: TCGdexCardSearchResult) => void;
}

function getImageUrl(card: TCGdexCardSearchResult): string | null {
  return card.image ? `${card.image}/high.webp` : null;
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
    const imageUrl = getImageUrl(item);
    return (
      <TouchableOpacity
        style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}
        onPress={() => onCardPress(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Card: ${item.name}`}
      >
        <Image
          source={imageUrl}
          style={[styles.cardImage, { width: cardWidth, height: cardHeight }]}
          contentFit="contain"
          transition={200}
        />
        {!imageUrl && (
          <View style={[styles.noImagePlaceholder, { width: cardWidth, height: cardHeight }]}>
            <Text style={styles.noImageText}>?</Text>
          </View>
        )}
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
