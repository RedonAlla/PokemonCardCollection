import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { File } from 'expo-file-system';
import { cacheDirectory, writeAsStringAsync, readAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useChildrenStore } from '../store/useChildrenStore';
import {
  resetAllData,
  exportAllData,
  importFromJson,
  type ImportSummary,
} from '../database/dataManagement';
import { COLORS, RADII, SPACING } from '../theme/skiaTheme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXPORT_FILENAME = 'pokemon_collection_export.json';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataManagementScreen() {
  const insets = useSafeAreaInsets();
  const fetchChildren = useChildrenStore((s) => s.fetchChildren);

  // ---- Reset state ----
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // ---- Export state ----
  const [isExporting, setIsExporting] = useState(false);

  // ---- Import state ----
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // ---- Reset Database ----
  const handleReset = useCallback(async () => {
    setIsResetting(true);
    try {
      await resetAllData();
      await fetchChildren();
      setResetDialogVisible(false);
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to reset database.',
      );
    } finally {
      setIsResetting(false);
    }
  }, [fetchChildren]);

  // ---- Export to JSON ----
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);

      // Write to cache directory using the legacy API (v56 WritableStream
      // does not reliably flush to disk on iOS before shareAsync reads it).
      const fileUri = `${cacheDirectory}${EXPORT_FILENAME}`;
      await writeAsStringAsync(fileUri, json);

      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Pokémon Collection Data',
          UTI: 'public.json',
        });
      } else {
        Alert.alert(
          'Exported',
          `File saved to:\n${fileUri}\n\nSharing is not available on this device.`,
        );
      }
    } catch (err) {
      console.error("Error: ", err)
      Alert.alert(
        'Export Failed',
        err instanceof Error ? err.message : 'Could not export data.',
      );
    } finally {
      setIsExporting(false);
    }
  }, []);

  // ---- Import from JSON ----
  const handleImport = useCallback(async () => {
    setImportSummary(null);
    setImportError(null);

    try {
      const result = await File.pickFileAsync({
        mimeTypes: ['application/json'],
      });

      if (result.canceled || !result.result) return;

      // result.result is a File instance in v56
      const pickedFile = Array.isArray(result.result)
        ? result.result[0]
        : result.result;

      if (!pickedFile) return;

      setIsImporting(true);

      const content = await readAsStringAsync(pickedFile.uri);

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        setImportError('The selected file is not valid JSON.');
        return;
      }

      const summary = await importFromJson(parsed);
      setImportSummary(summary);
      await fetchChildren();
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Could not import data.',
      );
    } finally {
      setIsImporting(false);
    }
  }, [fetchChildren]);

  // ---- Render ----
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Data Management</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* -------------------------------------------------------- */}
        {/* Reset Database                                          */}
        {/* -------------------------------------------------------- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚠️</Text>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardTitle}>Reset Database</Text>
              <Text style={styles.cardDescription}>
                Permanently delete all children and their card collections.
              </Text>
            </View>
          </View>
          <Button
            title="Reset Database"
            onPress={() => setResetDialogVisible(true)}
            variant="danger"
            size="medium"
            fullWidth
            loading={isResetting}
          />
        </View>

        {/* -------------------------------------------------------- */}
        {/* Export to JSON                                          */}
        {/* -------------------------------------------------------- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📤</Text>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardTitle}>Export to JSON</Text>
              <Text style={styles.cardDescription}>
                Save all data to a JSON file and share via AirDrop, email, or
                cloud storage.
              </Text>
            </View>
          </View>
          <Button
            title="Export to JSON"
            onPress={handleExport}
            variant="primary"
            size="medium"
            fullWidth
            loading={isExporting}
          />
        </View>

        {/* -------------------------------------------------------- */}
        {/* Import from JSON                                        */}
        {/* -------------------------------------------------------- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📥</Text>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardTitle}>Import from JSON</Text>
              <Text style={styles.cardDescription}>
                Restore data from a previously exported JSON file. Duplicate
                records are skipped automatically.
              </Text>
            </View>
          </View>
          <Button
            title="Import from JSON"
            onPress={handleImport}
            variant="secondary"
            size="medium"
            fullWidth
            loading={isImporting}
          />

          {/* Import result summary */}
          {importSummary && (
            <View style={styles.summaryBanner}>
              <Text style={styles.summaryTitle}>Import Complete</Text>
              <Text style={styles.summaryText}>
                Imported {importSummary.children}{' '}
                {importSummary.children === 1 ? 'child' : 'children'},{' '}
                {importSummary.cards}{' '}
                {importSummary.cards === 1 ? 'card' : 'cards'},{' '}
                {importSummary.collection} collection{' '}
                {importSummary.collection === 1 ? 'entry' : 'entries'}.
              </Text>
            </View>
          )}

          {/* Import error */}
          {importError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorTitle}>Import Failed</Text>
              <Text style={styles.errorText}>{importError}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reset confirmation dialog */}
      <ConfirmDialog
        visible={resetDialogVisible}
        title="Reset Database"
        message="This will permanently delete all children and their card collections. Are you sure?"
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setResetDialogVisible(false)}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.white10,
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.gold },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.lg },

  /* Action cards */
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  cardIcon: { fontSize: 28, marginTop: 2 },
  cardTitleBlock: { flex: 1 },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  /* Import summary */
  summaryBanner: {
    backgroundColor: '#143D2E',
    borderRadius: RADII.md,
    padding: SPACING.md,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.success,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.success,
    lineHeight: 20,
  },

  /* Import error */
  errorBanner: {
    backgroundColor: '#3E1515',
    borderRadius: RADII.md,
    padding: SPACING.md,
    gap: 4,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    lineHeight: 20,
  },
});
