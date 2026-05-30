import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Button } from './Button';
import { useColors, RADII } from '../../theme/skiaTheme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const COLORS = useColors();

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: COLORS.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    dialog: {
      backgroundColor: COLORS.surfaceElevated,
      borderRadius: RADII.xl,
      padding: 24,
      width: '100%',
      maxWidth: 360,
    },
    title: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
    message: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 24 },
    buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    cancelButton: {
      paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADII.sm,
      backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.white10,
    },
    cancelText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
  }), [COLORS]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelButton}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <Button title={confirmLabel} onPress={onConfirm} variant={variant} size="small" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
