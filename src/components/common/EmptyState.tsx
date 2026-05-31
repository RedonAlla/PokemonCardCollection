import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from './Button';
import { useColors } from '../../theme/skiaTheme';

interface EmptyStateProps {
  icon?: string;
  image?: ReturnType<typeof require>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  image,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const COLORS = useColors();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingVertical: 64,
    },
    icon: { fontSize: 64, marginBottom: 16 },
    image: { width: 120, height: 120, marginBottom: 16, opacity: 0.6 },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: COLORS.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    description: {
      fontSize: 16,
      color: COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    action: { minWidth: 200 },
  }), [COLORS]);
  return (
    <View style={styles.container}>
      {image ? (
        <Image source={image} style={styles.image} resizeMode="contain" />
      ) : (
        <Text style={styles.icon}>{icon ?? '📦'}</Text>
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} variant="primary" />
        </View>
      )}
    </View>
  );
}
