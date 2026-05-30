import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { SearchResultsGrid } from '../components/search/SearchResultsGrid';
import { CardAssignSheet } from '../components/search/CardAssignSheet';
import { useAppStore } from '../store/useAppStore';
import { searchCardsByName } from '../services/tcgdexApi';
import type { TCGdexCardSearchResult } from '../types/api';
import type { RootStackParamList } from '../core/Navigation';
import { COLORS, RADII } from '../theme/skiaTheme';

type SearchNav = NativeStackNavigationProp<RootStackParamList, 'Search'>;

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SearchNav>();
  const isOnline = useAppStore((s) => s.isOnline);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TCGdexCardSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TCGdexCardSearchResult | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed || isSearching) return;
    Keyboard.dismiss(); setIsSearching(true); setError(null); setHasSearched(true);
    try { setResults(await searchCardsByName(trimmed)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Search failed.'); setResults([]); }
    finally { setIsSearching(false); }
  }, [query, isSearching]);

  const canSearch = query.trim().length > 0 && !isSearching;
  const showEmpty = hasSearched && !isSearching && !error && results.length === 0;
  const showResults = results.length > 0;

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerCenter}><Text style={styles.title}>Search</Text></View>
          <View style={styles.headerSpacer} />
        </View>
        {!isOnline && <View style={styles.offlineBanner}><Text style={styles.offlineText}>Offline — search requires internet.</Text></View>}
        <View style={styles.searchRow}>
          <TextInput style={styles.searchInput} value={query} onChangeText={setQuery}
            placeholder="Enter card name..." placeholderTextColor={COLORS.textMuted}
            returnKeyType="search" autoCapitalize="words" autoCorrect={false}
            editable={!isSearching} onSubmitEditing={handleSearch} accessibilityLabel="Card name search input" />
          <Button title="Search" onPress={handleSearch} variant="primary" size="medium" disabled={!canSearch} loading={isSearching} />
        </View>
        {error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text><Button title="Retry" onPress={handleSearch} variant="secondary" size="small" /></View>}
        {isSearching && <View style={styles.loadingContainer}><ActivityIndicator color={COLORS.gold} size="large" /><Text style={styles.loadingText}>Searching...</Text></View>}
        {showEmpty && <EmptyState icon="🔍" title="No Cards Found" description={`No cards matching "${query.trim()}". Try a different term.`} />}
        {showResults && !isSearching && <SearchResultsGrid results={results} onCardPress={(card) => { setSelectedCard(card); setSheetVisible(true); }} />}
      </View>
      <CardAssignSheet visible={sheetVisible} card={selectedCard} onClose={() => { setSheetVisible(false); setSelectedCard(null); }} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.white10 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.gold },
  headerSpacer: { width: 64 },
  offlineBanner: { backgroundColor: '#3E2515', marginHorizontal: 16, marginTop: 12, padding: 10, borderRadius: RADII.sm },
  offlineText: { fontSize: 13, color: '#C28641', textAlign: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  searchInput: { flex: 1, backgroundColor: COLORS.surfaceElevated, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.white10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: COLORS.textPrimary },
  errorBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3E1515', marginHorizontal: 16, padding: 12, borderRadius: RADII.md, marginBottom: 8 },
  errorText: { flex: 1, fontSize: 14, color: COLORS.danger, marginRight: 12 },
  loadingContainer: { paddingVertical: 48, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: COLORS.textSecondary },
});
