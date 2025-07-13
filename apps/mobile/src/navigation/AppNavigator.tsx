import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import AIChatbotScreen from '../screens/AIChatbotScreen';
import { useAuth } from '../hooks/useAuth';
import { Auth } from '../components/Auth';
import SplashScreen from '../screens/SplashScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddWordScreen from '../screens/AddWordScreen';
import WordListScreen from '../screens/WordListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import StudySessionScreen from '../screens/StudySessionScreen';
import { StudyConfig } from '../types';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  AddWord: undefined;
  StudySession: { studyConfig: StudyConfig };
  AIChatbot: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Simple fallback component in case of navigation errors
const NavigationFallback = () => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackText}>
      Unable to load navigation. Please restart the app.
    </Text>
  </View>
);

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FCA311',
        tabBarInactiveTintColor: '#6B7280',
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconEmoji;
          
          switch (route.name) {
            case 'Dashboard':
              iconEmoji = '🏠';
              break;
            case 'WordList':
              iconEmoji = '📚';
              break;
            case 'Profile':
              iconEmoji = '👤';
              break;
            case 'Assistant':
              iconEmoji = '🤖';
              break;
            default:
              iconEmoji = '📖';
          }
          
          return <Text style={{ fontSize: size, color }}>{iconEmoji}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="WordList" component={WordListScreen} />
      <Tab.Screen name="Assistant" component={AIChatbotScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={MainTabNavigator} />
    <Stack.Screen name="AddWord" component={AddWordScreen} />
    <Stack.Screen name="StudySession" component={StudySessionScreen} />
    <Stack.Screen name="AIChatbot" component={AIChatbotScreen} />
  </Stack.Navigator>
);

const AuthWrapper = () => {
  const { session } = useAuth();
  return <Auth session={session} />;
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth" component={AuthWrapper} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, loading, error } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Add a small delay to ensure all navigation dependencies are ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading || !isNavigationReady) {
    return <SplashScreen />;
  }

  // Custom theme with better error handling
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#FFFFFF',
    },
  };

  return (
    <NavigationContainer
      theme={theme}
      fallback={<NavigationFallback />}
      onStateChange={(state) => {
        // Log navigation state changes but don't crash if there's an error
        try {
          if (state) {
            // Optional: log navigation state for debugging
          }
        } catch (e) {
          console.warn('Navigation state change error:', e);
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  fallbackText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4B5563',
  },
});

export default AppNavigator; 