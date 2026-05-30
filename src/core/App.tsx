import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Providers } from './Providers';
import { Navigation } from './Navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <Providers>
        <Navigation />
      </Providers>
    </SafeAreaProvider>
  );
}
