import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getInitials } from '../../utils/colors';

interface ChildAvatarProps {
  name: string;
  color: string;
  size?: number;
}

export function ChildAvatar({ name, color, size = 48 }: ChildAvatarProps) {
  const initials = getInitials(name);
  const fontSize = size * 0.38;
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}
      accessibilityLabel={`${name}'s avatar`}>
      <Text style={[styles.initials, { fontSize }]} numberOfLines={1} adjustsFontSizeToFit>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
});
