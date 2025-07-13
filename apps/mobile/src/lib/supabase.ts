import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Default fallback values
const FALLBACK_SUPABASE_URL = 'https://lxueubcappfiykvpdjfv.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dWV1YmNhcHBmaXlrdnBkamZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTIyNTgsImV4cCI6MjA2NjE2ODI1OH0.xcLOBVDZW2FEyA4xjC54EkvtiL6IsY0D45HE4m_IIpo';

// Create a more resilient storage adapter
const createStorageAdapter = () => {
  // In-memory fallback storage if SecureStore fails
  const memoryStorage: Record<string, string> = {};
  
  // Wrap SecureStore methods in try-catch blocks
  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        // Try to use SecureStore first
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        if (__DEV__) {
          console.warn('SecureStore.getItemAsync failed, using memory fallback', error);
        }
        return memoryStorage[key] || null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        // Try to use SecureStore first
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        if (__DEV__) {
          console.warn('SecureStore.setItemAsync failed, using memory fallback', error);
        }
        memoryStorage[key] = value;
      }
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        // Try to use SecureStore first
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        if (__DEV__) {
          console.warn('SecureStore.deleteItemAsync failed, using memory fallback', error);
        }
        delete memoryStorage[key];
      }
    }
  };
};

// Try multiple ways to get environment variables for different build types
const getEnvVar = (varName: string, fallback: string): string => {
  try {
    // Try all possible sources for the environment variable
    const value = 
      Constants.expoConfig?.extra?.[varName] ||
      Constants.manifest2?.extra?.expoClient?.extra?.[varName] ||
      process.env[varName] ||
      fallback;
      
    return value;
  } catch (error) {
    if (__DEV__) {
      console.warn(`Error accessing ${varName}, using fallback value`, error);
    }
    return fallback;
  }
};

const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL', FALLBACK_SUPABASE_URL);
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', FALLBACK_SUPABASE_ANON_KEY);

// Create the Supabase client with enhanced error handling
let supabase;
try {
  supabase = createClient(
    supabaseUrl || FALLBACK_SUPABASE_URL, 
    supabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY, 
    {
      auth: {
        storage: createStorageAdapter(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  
  // Create a minimal client as fallback
  supabase = createClient(
    FALLBACK_SUPABASE_URL,
    FALLBACK_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  );
}

export { supabase }; 