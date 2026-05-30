import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/common/Button';
import { ChildAvatar } from '../components/children/ChildAvatar';
import { useChildrenStore } from '../store/useChildrenStore';
import { validateChildName } from '../utils/validators';
import { CHILD_COLORS } from '../types/child';
import type { RootStackParamList } from '../core/Navigation';
import { COLORS, RADII } from '../theme/skiaTheme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddChild'>;

export function AddChildScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const addChild = useChildrenStore((s) => s.addChild);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(CHILD_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    const trimmed = name.trim();
    const validation = validateChildName(trimmed);
    if (!validation.valid) { setError(validation.error ?? 'Invalid name'); return; }
    setIsSaving(true); setError(null);
    try { await addChild(trimmed, color); navigation.goBack(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to add child'); }
    finally { setIsSaving(false); }
  }, [name, color, addChild, navigation]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="secondary" size="small" />
        <Text style={styles.title}>Add Collector</Text>
        <View style={{ width: 64 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.preview}><ChildAvatar name={name || '?'} color={color} size={80} /></View>
        <Text style={styles.label}>NAME</Text>
        <TextInput style={[styles.input, error ? styles.inputError : null]} value={name}
          onChangeText={(t) => { setName(t); setError(null); }} placeholder="Enter child name"
          placeholderTextColor={COLORS.textMuted} maxLength={50} autoCapitalize="words" autoFocus />
        {error && <Text style={styles.errorText}>{error}</Text>}
        <Text style={styles.label}>COLOR</Text>
        <View style={styles.colorRow}>
          {CHILD_COLORS.map((c) => (
            <TouchableOpacity key={c} onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c }, c === color && styles.colorDotSelected]}>
              {c === color && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button title="Add Collector" onPress={handleSave} variant="primary" size="large" fullWidth
          disabled={name.trim().length === 0} loading={isSaving} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.white10 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.gold },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  preview: { alignItems: 'center', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.surfaceElevated, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.white10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 17, color: COLORS.textPrimary, marginBottom: 20 },
  inputError: { borderColor: COLORS.danger },
  errorText: { fontSize: 14, color: COLORS.danger, marginBottom: 16, marginTop: -12 },
  colorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorDot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  colorDotSelected: { borderWidth: 3, borderColor: COLORS.gold },
  checkmark: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  footer: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.white10, paddingHorizontal: 16, paddingTop: 12 },
});
