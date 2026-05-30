import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChildAvatar } from './ChildAvatar';
import { useColors, RADII } from '../../theme/skiaTheme';
import type { ChildWithCount } from '../../types/database';

interface ChildSelectorProps {
  children: ChildWithCount[];
  selectedIds: Set<number>;
  onToggle: (childId: number) => void;
}

export function ChildSelector({ children, selectedIds, onToggle }: ChildSelectorProps) {
  const COLORS = useColors();

  const styles = useMemo(() => StyleSheet.create({
    container: { gap: 8 },
    empty: { padding: 24, alignItems: 'center' },
    emptyText: { fontSize: 15, color: COLORS.textMuted },
    row: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16,
      backgroundColor: COLORS.surface, borderRadius: RADII.md, borderWidth: 2, borderColor: 'transparent',
    },
    rowSelected: {
      backgroundColor: `${COLORS.electricBlue}15`, borderColor: COLORS.electricBlue,
    },
    name: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
    checkbox: {
      width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.textMuted,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxSelected: { backgroundColor: COLORS.electricBlue, borderColor: COLORS.electricBlue },
    checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  }), [COLORS]);

  if (children.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No children to show</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {children.map(child => {
        const isSelected = selectedIds.has(child.id);
        return (
          <TouchableOpacity
            key={child.id}
            onPress={() => onToggle(child.id)}
            activeOpacity={0.7}
            style={[styles.row, isSelected && styles.rowSelected]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={`${child.name}${isSelected ? ', selected' : ''}`}
          >
            <ChildAvatar name={child.name} color={child.color} size={40} />
            <Text style={styles.name} numberOfLines={1}>{child.name}</Text>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
