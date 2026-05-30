import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import type { TCGdexCardSearchResult } from '../../types/api';
import type { OwnershipRow } from '../../types/database';
import type { RootStackParamList } from '../../core/Navigation';
import * as collectionsDb from '../../database/collections';
import { useChildrenStore } from '../../store/useChildrenStore';
import { Button } from '../common/Button';
import { ChildAvatar } from '../children/ChildAvatar';
import { EmptyState } from '../common/EmptyState';
import { COLORS, RADII } from '../../theme/skiaTheme';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const poketballImg = require('../../../assets/poketball-open.png');

interface CardAssignSheetProps {
  visible: boolean;
  card?: TCGdexCardSearchResult | null;
  onClose: () => void;
}

type VisibleViewProps = {
  visible: boolean;
}


function getImageUrl(card: TCGdexCardSearchResult): string | null {
  return card.image ? `${card.image}/high.webp` : null;
}

export function CardAssignSheet({ visible, card, onClose }: CardAssignSheetProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const children = useChildrenStore((s) => s.children);
  const fetchChildren = useChildrenStore((s) => s.fetchChildren);
  const [ownership, setOwnership] = useState<OwnershipRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingChildIds, setAddingChildIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!visible || !card) return;

    let cancelled = false;

    async function load() {
      setIsLoading(true); await fetchChildren();
      try {
        const rows = await collectionsDb.getCardOwnership(card!.id);
        if (!cancelled) setOwnership(rows);
      }
      catch { if (!cancelled) setOwnership([]); }
      finally { if (!cancelled) setIsLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [visible, card, fetchChildren]);

  useEffect(() => { if (!visible) setAddingChildIds(new Set()); }, [visible]);

  const handleAdd = useCallback(async (childId: number) => {
    if (!card) return;
    setAddingChildIds(prev => new Set(prev).add(childId));
    try {
      await collectionsDb.assignCardToChildren(
        { tcgdexId: card.id, name: card.name, setName: card.set?.name ?? '', setId: card.set?.id ?? '',
          edition: 'unlimited', imageUrl: getImageUrl(card), cardType: null, hp: null, rarity: null },
        [childId]
      );
      setOwnership(prev => prev.map(row => row.child_id === childId ? { ...row, owns_card: 1 } : row));
      fetchChildren(); // refresh card counts on HomeScreen
    } catch(ex) { console.error('Error: ', ex) }
    finally { setAddingChildIds(prev => { const n = new Set(prev); n.delete(childId); return n; }); }
  }, [card]);

  if (!card) return null;
  const imageUrl = getImageUrl(card);
  const previewWidth = screenWidth * 0.8;
  const previewHeight = previewWidth * 1.5;
  const allOwn = ownership.length > 0 && ownership.every(r => r.owns_card === 1);
  const isReady = Boolean(!isLoading && children.length > 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.sheet, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <Header onClose={onClose} visible={true}/>
        <View style={styles.cardPreviewContainer}>
          <Image source={imageUrl} style={[styles.cardPreviewImage, { width: previewWidth, height: previewHeight }]}
            contentFit="contain" transition={200} />
        </View>
        <View style={styles.divider} />
        <Loading visible={isLoading} />
        <EmptyStateView visible={children.length < 1} onClose={onClose} />
        { isReady && (
          <ScrollView style={styles.childrenList} showsVerticalScrollIndicator={false} bounces={false}>

            <AllOwnView visible={allOwn} />

            {ownership.map(row => {
              const owns = row.owns_card === 1;
              const isAdding = addingChildIds.has(row.child_id);
              return (
                <View key={row.child_id} style={styles.childRow}>
                  <ChildAvatar name={row.child_name} color={row.child_color} size={40} />
                  <Text style={[styles.childName, owns && styles.childNameMuted]} numberOfLines={1}>{row.child_name}</Text>
                  <View style={styles.rowAction}>
                    {
                      owns
                        ? <OwnsBadge visible={owns} />
                        : <Button title="Add" onPress={() => handleAdd(row.child_id)} variant="primary" size="small"
                        loading={isAdding} disabled={isAdding} />
                    }
                  </View>
                </View>
              );
            })
          }
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

export function AllOwnView({ visible }: VisibleViewProps) {
  if(!visible) return null;

  return (
    <View style={styles.allOwnBanner}>
      <Text style={styles.allOwnText}>🎉 Everyone already owns this card!</Text>
    </View>
  );
}

export function OwnsBadge({ visible }: VisibleViewProps) {
  if(!visible) return null;

  return (
    <View style={styles.ownsBadge}>
      <Text style={styles.ownsText}>✅ Owns</Text>
    </View>
  );
}

export function Loading({ visible }: VisibleViewProps) {
  if(!visible) return null;

  return (
    <View style={styles.loadingContainer}><ActivityIndicator color={COLORS.gold} size="large" />
      <Text style={styles.loadingText}>Loading collectors...</Text>
    </View>
  );
}


export function Header({ onClose }: CardAssignSheetProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Assign Card</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close">
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

export function EmptyStateView({ visible, onClose }: CardAssignSheetProps) {
  if(!visible) return null;

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleClose = () => {
    onClose();
    setTimeout(() => navigation.navigate('AddChild'), 300);
  }

  return (
    <EmptyState
      image={poketballImg}
      title="No Collectors Yet"
      description="Add a collector first to start assigning cards."
      actionLabel="Add Collector"
      onAction={handleClose} />
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: COLORS.surfaceElevated, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 3 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gold },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white10, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  cardPreviewContainer: { alignItems: 'center', marginBottom: 12 },
  cardPreviewImage: { borderRadius: RADII.md, backgroundColor: COLORS.surface },
  divider: { height: 1, backgroundColor: COLORS.white10, marginVertical: 8 },
  loadingContainer: { paddingVertical: 32, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: COLORS.textSecondary },
  childrenList: { flex: 1 },
  allOwnBanner: { backgroundColor: '#143D2E', borderRadius: RADII.sm, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  allOwnText: { fontSize: 14, color: COLORS.success, fontWeight: '500', textAlign: 'center' },
  childRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.white05, gap: 12 },
  childName: { flex: 1, fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
  childNameMuted: { opacity: 0.4 },
  rowAction: { minWidth: 80, alignItems: 'flex-end' },
  ownsBadge: { paddingHorizontal: 12, paddingVertical: 6 },
  ownsText: { fontSize: 14, fontWeight: '500', color: COLORS.success },
});
