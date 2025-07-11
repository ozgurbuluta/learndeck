import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

// Platform-specific storage implementation
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Default fallback values
const FALLBACK_SUPABASE_URL = 'https://lxueubcappfiykvpdjfv.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dWV1YmNhcHBmaXlrdnBkamZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTIyNTgsImV4cCI6MjA2NjE2ODI1OH0.xcLOBVDZW2FEyA4xjC54EkvtiL6IsY0D45HE4m_IIpo';

// Try multiple ways to get environment variables for different build types
const getEnvVar = (
  varName: string,
  fallback: string
): string => {
  try {
    // Try all possible sources for the environment variable
    const value = 
      Constants.expoConfig?.extra?.[varName] ||
      Constants.manifest2?.extra?.expoClient?.extra?.[varName] ||
      process.env[varName] ||
      fallback;
      
    return value;
  } catch (error) {
    console.warn(`Error accessing ${varName}, using fallback value`, error);
    return fallback;
  }
};

const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL', FALLBACK_SUPABASE_URL);
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', FALLBACK_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "Supabase URL or Anon Key is missing. Using fallback values.";
  console.warn(errorMessage);
  
  // Only show alert in development, not in production
  if (__DEV__) {
    // Use setTimeout to avoid blocking the UI thread during initialization
    setTimeout(() => {
      Alert.alert(
        "Configuration Warning",
        errorMessage,
        [{ text: "OK" }]
      );
    }, 1000);
  }
}

export const supabase = createClient(
  supabaseUrl || FALLBACK_SUPABASE_URL, 
  supabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY, 
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
); 