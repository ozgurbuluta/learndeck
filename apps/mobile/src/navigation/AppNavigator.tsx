import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
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
import { StudyConfig } from '@shared/types';

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
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
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

export default AppNavigator; 