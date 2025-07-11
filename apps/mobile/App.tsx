import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import SafeGestureWrapper from './src/components/SafeGestureWrapper';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeGestureWrapper>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <AppNavigator />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </SafeGestureWrapper>
    </ErrorBoundary>
  );
}
