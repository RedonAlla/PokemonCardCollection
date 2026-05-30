import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { COLORS } from '../../theme/skiaTheme';
import { PokemonCard } from '../common/card/PokemonCard';

interface HoloCardViewerProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export function HoloCardViewer({ visible, imageUrl, onClose }: HoloCardViewerProps) {
  const insets = useSafeAreaInsets();

  const panGesture = Gesture.Pan();

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={[styles.closeBtn, { top: insets.top + 16 }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close viewer"
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <PokemonCard imageUrl={imageUrl} />
        </View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)'
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600'
  }
});
