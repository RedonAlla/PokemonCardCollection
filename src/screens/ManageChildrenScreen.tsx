import React, { useCallback, useState, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/common/Button';
import { ChildAvatar } from '../components/children/ChildAvatar';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useChildrenStore } from '../store/useChildrenStore';
import type { ChildWithCount } from '../types/database';
import type { RootStackParamList } from '../core/Navigation';
import { useColors, RADII } from '../theme/skiaTheme';
import { pokeballImg } from '../utils/images';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ManageChildren'>;

export function ManageChildrenScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const COLORS = useColors();
  const { children, isLoading, fetchChildren, renameChild, deleteChild } = useChildrenStore();
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameText, setRenameText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const childToDelete = children.find(c => c.id === deleteConfirmId);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.white10 },
    title: { fontSize: 20, fontWeight: '700', color: COLORS.gold },
    list: { padding: 16, gap: 8 },
    listEmpty: { flex: 1 },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADII.md, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    rowInfo: { flex: 1, marginLeft: 12 },
    name: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
    cardCount: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    renameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    renameInput: { flex: 1, fontSize: 17, color: COLORS.textPrimary, borderBottomWidth: 2, borderBottomColor: COLORS.gold, paddingVertical: 4 },
    inlineBtn: { padding: 8 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    deleteBtn: { padding: 8 },
    deleteIcon: { fontSize: 20 },
    footer: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.white10, paddingHorizontal: 16, paddingTop: 12 },
  }), [COLORS]);

  const handleDelete = useCallback(async () => {
    if (deleteConfirmId === null) return;
    try { await deleteChild(deleteConfirmId); } catch { /* ignore */ }
    setDeleteConfirmId(null);
  }, [deleteConfirmId, deleteChild]);

  const renderChild = useCallback(({ item }: { item: ChildWithCount }) => {
    const isRenaming = renamingId === item.id;
    return (
      <View style={styles.row}>
        <ChildAvatar name={item.name} color={item.color} size={44} />
        <View style={styles.rowInfo}>
          {isRenaming ? (
            <View style={styles.renameRow}>
              <TextInput style={styles.renameInput} value={renameText} onChangeText={setRenameText}
                autoFocus placeholderTextColor={COLORS.textMuted} onSubmitEditing={async () => { try { await renameChild(item.id, renameText.trim()); setRenamingId(null); } catch {} }}
              />
              <TouchableOpacity onPress={async () => { try { await renameChild(item.id, renameText.trim()); setRenamingId(null); } catch {} }}
                style={styles.inlineBtn}><Text style={{ color: COLORS.success }}>✓</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setRenamingId(null)} style={styles.inlineBtn}><Text style={{ color: COLORS.textMuted }}>✕</Text></TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardCount}>{item.card_count} cards</Text>
            </>
          )}
        </View>
        {!isRenaming && (
          <View style={styles.actions}>
            <Button title="Rename" onPress={() => { setRenamingId(item.id); setRenameText(item.name); }} variant="secondary" size="small" />
            <TouchableOpacity onPress={() => setDeleteConfirmId(item.id)} style={styles.deleteBtn}
              accessibilityLabel={`Delete ${item.name}`}><Text style={styles.deleteIcon}>🗑</Text></TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [renamingId, renameText, renameChild]);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Button title="←" onPress={() => navigation.goBack()} variant="secondary" size="small" />
          <Text style={styles.title}>Manage Collectors</Text>
          <View style={{ width: 64 }} />
        </View>
        <FlatList data={children} keyExtractor={item => `child-${item.id}`} renderItem={renderChild}
          contentContainerStyle={[styles.list, children.length === 0 && styles.listEmpty]}
          ListEmptyComponent={!isLoading ? <EmptyState image={pokeballImg} title="No Collectors"
            description="Add your first collector to start tracking cards." actionLabel="Add Collector"
            onAction={() => navigation.navigate('AddChild')} /> : null}
          showsVerticalScrollIndicator={false}
        />
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button title="+ Add Collector" onPress={() => navigation.navigate('AddChild')} variant="primary" size="large" fullWidth />
        </View>
        <ConfirmDialog visible={deleteConfirmId !== null}
          title="Delete Collector"
          message={childToDelete ? `Delete "${childToDelete.name}" and all their ${childToDelete.card_count} cards?` : ''}
          confirmLabel="Delete" variant="danger" onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      </View>
    </ErrorBoundary>
  );
}
