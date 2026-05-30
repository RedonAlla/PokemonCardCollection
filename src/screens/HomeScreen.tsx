import React, { useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useChildrenStore } from '../store/useChildrenStore';
import { ChildProfileCard } from '../components/children/ChildProfileCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { Button } from '../components/common/Button';
import type { ChildWithCount } from '../types/database';
import type { RootStackParamList } from '../core/Navigation';
import { useColors } from '../theme/skiaTheme';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const poketballImg = require('../../assets/poketball-open.png');

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNav>();
  const COLORS = useColors();
  const { children, isLoading, error, fetchChildren } = useChildrenStore();

  useEffect(() => { fetchChildren(); }, [fetchChildren]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    title: { fontSize: 28, fontWeight: '700', color: COLORS.gold },
    subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
    errorBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3E1515', marginHorizontal: 16, padding: 12, borderRadius: 12, marginBottom: 8 },
    errorText: { flex: 1, fontSize: 14, color: COLORS.danger, marginRight: 12 },
    loadingContainer: { padding: 16, gap: 10 },
    skeletonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    skeletonAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.surfaceElevated },
    skeletonText: { marginLeft: 16, flex: 1, gap: 6 },
    skeletonLine: { height: 14, backgroundColor: COLORS.surfaceElevated, borderRadius: 4, width: '60%' },
    skeletonLineShort: { width: '35%' },
    list: { paddingBottom: 24 },
    listEmpty: { flex: 1 },
  }), [COLORS]);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Pokémon Cards</Text>
            <Text style={styles.subtitle}>{children.length} {children.length === 1 ? 'collector' : 'collectors'}</Text>
          </View>
          <Button title="Manage" onPress={() => navigation.navigate('ManageChildren')} variant="secondary" size="small" />
        </View>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={fetchChildren} variant="secondary" size="small" />
          </View>
        )}
        {isLoading && children.length === 0 && (
          <View style={styles.loadingContainer}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonText}>
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
                </View>
              </View>
            ))}
          </View>
        )}
        <FlatList
          data={children}
          keyExtractor={item => `child-${item.id}`}
          renderItem={({ item }: { item: ChildWithCount }) => (
            <ChildProfileCard child={item} onPress={() => navigation.navigate('Collection', { childId: item.id, childName: item.name, childColor: item.color })} />
          )}
          contentContainerStyle={[styles.list, children.length === 0 && styles.listEmpty]}
          ListEmptyComponent={!isLoading ? <EmptyState image={poketballImg} title="No Collectors Yet"
            description="Add your first child to start tracking their Pokémon card collection."
            actionLabel="Add Collector" onAction={() => navigation.navigate('AddChild')} /> : null}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchChildren} tintColor={COLORS.gold} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ErrorBoundary>
  );
}
