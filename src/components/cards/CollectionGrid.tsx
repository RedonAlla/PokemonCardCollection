import React from 'react';
import { FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { CardGridItem } from './CardGridItem';
import { EmptyState } from '../common/EmptyState';
import { GRID_COLUMNS, GRID_SPACING } from '../../utils/constants';
import type { CardWithDateAdded } from '../../types/database';
import { pokeballImg } from '../../utils/images';

interface CollectionGridProps {
  cards: CardWithDateAdded[];
  isLoading: boolean;
  onCardPress: (card: CardWithDateAdded) => void;
  onCardLongPress?: (card: CardWithDateAdded) => void;
  emptyMessage?: string;
}

export function CollectionGrid({
  cards,
  isLoading,
  onCardPress,
  onCardLongPress,
  emptyMessage = 'No cards yet. Scan some!',
}: CollectionGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - GRID_SPACING * 2 - GRID_SPACING * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  if (!isLoading && cards.length === 0) {
    return (
      <EmptyState
        image={pokeballImg}
        title={emptyMessage}
        description="Search for a card and add it to this collection."
      />
    );
  }

  return (
    <FlatList
      data={cards}
      keyExtractor={item => `card-${item.id}`}
      numColumns={GRID_COLUMNS}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      renderItem={({ item, index }) => (
        <CardGridItem
          card={item}
          index={index}
          onPress={() => onCardPress(item)}
          onLongPress={onCardLongPress ? () => onCardLongPress(item) : undefined}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: GRID_SPACING,
    paddingBottom: 32,
  },
  row: {
    gap: GRID_SPACING,
  },
});
