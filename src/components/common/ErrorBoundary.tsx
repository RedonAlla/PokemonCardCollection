import React, { Component, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { useColors } from '../../theme/skiaTheme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Wrapper that uses the hook to get themed colours and passes them to the class
function ErrorFallback({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  const COLORS = useColors();
  return (
    <View style={[stylesBase.container, { backgroundColor: COLORS.background }]}>
      <Text style={stylesBase.emoji}>⚠️</Text>
      <Text style={[stylesBase.title, { color: COLORS.textPrimary }]}>{title}</Text>
      <Text style={[stylesBase.message, { color: COLORS.textSecondary }]}>{message}</Text>
      <Button title="Try Again" onPress={onRetry} variant="primary" />
    </View>
  );
}

const stylesBase = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  message: { fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
});

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          title={this.props.fallbackTitle ?? 'Something went wrong'}
          message={this.props.fallbackMessage ?? 'An unexpected error occurred. Please try again.'}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
