import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, AppState, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Simple loading component that doesn't rely on any external dependencies
const SimpleLoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
    <Text style={{ fontSize: 18, color: '#14213D' }}>Loading...</Text>
  </View>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);

  // Delay rendering of the full app to ensure all native modules are initialized
  useEffect(() => {
    // Use a short timeout to ensure the JS thread has time to initialize
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // If not ready, show a simple loading screen that doesn't depend on any native modules
  if (!isReady) {
    return <SimpleLoadingScreen />;
  }

  // The proper component hierarchy:
  // 1. ErrorBoundary (catches JS errors)
  // 2. GestureHandlerRootView (required by gesture-handler)
  // 3. SafeAreaProvider (required by safe-area-context)
  // 4. AppNavigator (the actual app)
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <View style={styles.container}>
            <AppNavigator />
            <StatusBar style="auto" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
