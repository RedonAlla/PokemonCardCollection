import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCards } from '../hooks/useCards';
import { useDebounce } from '../hooks/useDebounce';
import { CollectionGrid } from '../components/cards/CollectionGrid';
import { CardSearchBar } from '../components/cards/CardSearchBar';
import { HoloCardViewer } from '../components/cards/HoloCardViewer';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useCollectionStore } from '../store/useCollectionStore';
import { useChildrenStore } from '../store/useChildrenStore';
import type { CardWithDateAdded } from '../types/database';
import type { RootStackParamList } from '../core/Navigation';
import { useColors, RADII } from '../theme/skiaTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Collection'>;
type CollectionNav = NativeStackNavigationProp<RootStackParamList, 'Collection'>;

export function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const COLORS = useColors();
  const navigation = useNavigation<CollectionNav>();
  const route = useRoute<Props['route']>();
  const { childId, childName, childColor } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { cards, isLoading, error, refresh } = useCards(childId, debouncedSearch);
  const { removeCardFromChild } = useCollectionStore();
  const fetchChildren = useChildrenStore((s) => s.fetchChildren);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardWithDateAdded | null>(null);

  const handleCardPress = useCallback((card: CardWithDateAdded) => {
    if (card.image_url) { setViewerImage(card.image_url); setViewerVisible(true); }
  }, []);
  const handleCardLongPress = useCallback((card: CardWithDateAdded) => {
    setCardToDelete(card); setDeleteDialogVisible(true);
  }, []);
  const handleDeleteConfirm = useCallback(async () => {
    if (!cardToDelete) return;
    try { await removeCardFromChild(childId, cardToDelete.id); refresh(); fetchChildren(); }
    catch { /* ignore */ }
    finally { setDeleteDialogVisible(false); setCardToDelete(null); }
  }, [childId, cardToDelete, removeCardFromChild, refresh]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.white10 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
    headerInfo: { alignItems: 'center', flex: 1 },
    title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
    count: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500', marginTop: 2 },
    colorBar: { height: 3 },
    errorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3E1515', marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: RADII.md },
    errorText: { flex: 1, fontSize: 14, color: COLORS.danger, marginRight: 12 },
  }), [COLORS]);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Button title="←" onPress={() => navigation.goBack()} variant="secondary" size="small" />
            <View style={styles.headerInfo}>
              <Text style={styles.title} numberOfLines={1}>{childName}</Text>
              <Text style={styles.count}>{cards.length} {cards.length === 1 ? 'card' : 'cards'}</Text>
            </View>
            <View style={{ width: 64 }} />
          </View>
          <View style={[styles.colorBar, { backgroundColor: childColor }]} />
        </View>
        <CardSearchBar value={searchQuery} onChangeText={setSearchQuery} />
        {error && <View style={styles.errorRow}><Text style={styles.errorText}>{error}</Text><Button title="Retry" onPress={refresh} variant="secondary" size="small" /></View>}
        <CollectionGrid cards={cards} isLoading={isLoading} onCardPress={handleCardPress} onCardLongPress={handleCardLongPress}
          emptyMessage={debouncedSearch ? `No cards matching "${debouncedSearch}"` : `${childName} has no cards yet.`} />
      </View>
      <HoloCardViewer visible={viewerVisible} imageUrl={viewerImage} onClose={() => setViewerVisible(false)} />
      <ConfirmDialog visible={deleteDialogVisible} title="Remove Card"
        message={cardToDelete ? `Remove "${cardToDelete.name}" from ${childName}'s collection?` : ''}
        confirmLabel="Remove" cancelLabel="Cancel" variant="danger" onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteDialogVisible(false); setCardToDelete(null); }} />
    </ErrorBoundary>
  );
}
