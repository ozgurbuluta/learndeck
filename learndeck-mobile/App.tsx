import './src/lib/polyfills';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthScreen } from './src/components/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { useAuth } from './src/hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <Stack.Screen name="Home" component={HomeScreen} />
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
