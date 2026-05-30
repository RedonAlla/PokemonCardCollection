import React, { useEffect, useState, useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDatabase } from '../database/init';
import { runMigrations } from '../database/migrations';
import { initializeSetMatcher } from '../services/setMatcher';
import { useAppStore } from '../store/useAppStore';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useColors } from '../theme/skiaTheme';

interface ProvidersProps { children: ReactNode }

export function Providers({ children }: ProvidersProps) {
  const COLORS = useColors();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const { setDbReady, setSetsLoaded } = useAppStore();

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1 },
    splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 32 },
    splashIcon: { fontSize: 64, marginBottom: 16 },
    splashTitle: { fontSize: 22, fontWeight: '700', color: COLORS.gold, marginBottom: 16 },
    spinner: { marginTop: 8 },
    errorIcon: { fontSize: 48, marginBottom: 16 },
    errorTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
    errorMessage: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  }), [COLORS]);

  useEffect(() => { initialize(); }, []);

  const initialize = async () => {
    try {
      await getDatabase();
      await runMigrations();
      setDbReady(true);
      try { await initializeSetMatcher(); setSetsLoaded([]); } catch { /* non-fatal */ }
    } catch (err) {
      setInitError(err instanceof Error ? err.message : 'Failed to initialize database');
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashIcon}>⚡</Text>
        <Text style={styles.splashTitle}>Pokémon Card Collection</Text>
        <ActivityIndicator size="small" color={COLORS.gold} style={styles.spinner} />
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.splash}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to Start</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </GestureHandlerRootView>
  );
}
