import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { useColors, RADII } from '../../theme/skiaTheme';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const poketballImg = require('../../../assets/poketball-open.png');

interface CardAssignSheetProps {
  visible: boolean;
  card?: TCGdexCardSearchResult | null;
  onClose: () => void;
}

type VisibleViewProps = { visible: boolean };

/** Shape of the themed styles object passed to sub-components. */
type AssignStyles = ReturnType<typeof StyleSheet.create<ReturnType<typeof createStyles>>>;

function getImageUrl(card: TCGdexCardSearchResult): string | null {
  return card.image ? `${card.image}/high.webp` : null;
}

// -----------------------------------------------------------------------
// Sub-components — receive `s` (styles) from the parent so they react to
// theme changes without needing their own useColors() calls.
// -----------------------------------------------------------------------

function AllOwnView({ visible, s }: VisibleViewProps & { s: AssignStyles }) {
  if (!visible) return null;
  return (
    <View style={s.allOwnBanner}>
      <Text style={s.allOwnText}>🎉 Everyone already owns this card!</Text>
    </View>
  );
}

function OwnsBadge({ visible, s }: VisibleViewProps & { s: AssignStyles }) {
  if (!visible) return null;
  return (
    <View style={s.ownsBadge}>
      <Text style={s.ownsText}>✅ Owns</Text>
    </View>
  );
}

function LoadingView({ visible, s }: VisibleViewProps & { s: AssignStyles }) {
  const COLORS = useColors();
  if (!visible) return null;
  return (
    <View style={s.loadingContainer}>
      <ActivityIndicator color={COLORS.gold} size="large" />
      <Text style={s.loadingText}>Loading collectors...</Text>
    </View>
  );
}

function SheetHeader({ onClose, s }: { onClose: () => void; s: AssignStyles }) {
  return (
    <View style={s.header}>
      <Text style={s.headerTitle}>Assign Card</Text>
      <TouchableOpacity onPress={onClose} style={s.closeButton} accessibilityRole="button" accessibilityLabel="Close">
        <Text style={s.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyStateView({ visible, onClose }: CardAssignSheetProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  if (!visible) return null;
  return (
    <EmptyState
      image={poketballImg}
      title="No Collectors Yet"
      description="Add a collector first to start assigning cards."
      actionLabel="Add Collector"
      onAction={() => { onClose(); setTimeout(() => navigation.navigate('AddChild'), 300); }}
    />
  );
}

// -----------------------------------------------------------------------
// Style factory — called inside useMemo so colours react to theme
// -----------------------------------------------------------------------

function createStyles(c: ReturnType<typeof useColors>) {
  return {
    sheet: { flex: 1, backgroundColor: c.surfaceElevated, paddingHorizontal: 20 },
    header: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingVertical: 8, marginBottom: 3 },
    headerTitle: { fontSize: 20, fontWeight: '700' as const, color: c.gold },
    closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.white10, alignItems: 'center' as const, justifyContent: 'center' as const },
    closeButtonText: { fontSize: 16, color: c.textSecondary, fontWeight: '600' as const },
    cardPreviewContainer: { alignItems: 'center' as const, marginBottom: 12 },
    cardPreviewImage: { borderRadius: RADII.md, backgroundColor: c.surface },
    divider: { height: 1, backgroundColor: c.white10, marginVertical: 8 },
    loadingContainer: { paddingVertical: 32, alignItems: 'center' as const, gap: 12 },
    loadingText: { fontSize: 15, color: c.textSecondary },
    childrenList: { flex: 1 },
    allOwnBanner: { backgroundColor: '#05df722f', borderRadius: RADII.sm, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
    allOwnText: { fontSize: 14, color: c.success, fontWeight: '500' as const, textAlign: 'center' as const },
    childRow: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.white05, gap: 12 },
    childName: { flex: 1, fontSize: 17, fontWeight: '600' as const, color: c.textPrimary },
    childNameMuted: { opacity: 0.4 },
    rowAction: { minWidth: 80, alignItems: 'flex-end' as const },
    ownsBadge: { backgroundColor: '#05df722f', borderRadius: RADII.sm, paddingHorizontal: 12, paddingVertical: 6 },
    ownsText: { fontSize: 14, fontWeight: '500' as const, color: c.success },
  } satisfies Record<string, object>;
}

// -----------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------

export function CardAssignSheet({ visible, card, onClose }: CardAssignSheetProps) {
  const insets = useSafeAreaInsets();
  const COLORS = useColors();
  const { width: screenWidth } = useWindowDimensions();
  const children = useChildrenStore((s) => s.children);
  const fetchChildren = useChildrenStore((s) => s.fetchChildren);
  const [ownership, setOwnership] = useState<OwnershipRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingChildIds, setAddingChildIds] = useState<Set<number>>(new Set());

  const s = useMemo(() => StyleSheet.create(createStyles(COLORS)), [COLORS]);

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
      <View style={[s.sheet, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <SheetHeader onClose={onClose} s={s} />
        <View style={s.cardPreviewContainer}>
          <Image source={imageUrl} style={[s.cardPreviewImage, { width: previewWidth, height: previewHeight }]}
            contentFit="contain" transition={200} />
        </View>
        <View style={s.divider} />
        <LoadingView visible={isLoading} s={s} />
        <EmptyStateView visible={children.length < 1} onClose={onClose} />
        {isReady && (
          <ScrollView style={s.childrenList} showsVerticalScrollIndicator={false} bounces={false}>
            <AllOwnView visible={allOwn} s={s} />
            {ownership.map(row => {
              const owns = row.owns_card === 1;
              const isAdding = addingChildIds.has(row.child_id);
              return (
                <View key={row.child_id} style={s.childRow}>
                  <ChildAvatar name={row.child_name} color={row.child_color} size={40} />
                  <Text style={[s.childName, owns && s.childNameMuted]} numberOfLines={1}>{row.child_name}</Text>
                  <View style={s.rowAction}>
                    {owns
                      ? <OwnsBadge visible={owns} s={s} />
                      : <Button title="Add" onPress={() => handleAdd(row.child_id)} variant="primary" size="small"
                          loading={isAdding} disabled={isAdding} />
                    }
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

