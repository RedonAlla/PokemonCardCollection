import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS, RADII } from '../../theme/skiaTheme';

interface CardSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function CardSearchBar({ value, onChangeText, placeholder = 'Search cards...' }: CardSearchBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="search"
        clearButtonMode="while-editing"
        accessibilityLabel="Search cards"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADII.md,
    marginHorizontal: 16, marginVertical: 8, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.white10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: {
    flex: 1, fontSize: 16, color: COLORS.textPrimary, paddingVertical: 12,
  },
  clearButton: { padding: 6 },
  clearText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
});
