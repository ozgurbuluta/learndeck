import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

// Platform-specific storage implementation
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Try multiple ways to get environment variables for different build types
const supabaseUrl = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  Constants.manifest2?.extra?.expoClient?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://lxueubcappfiykvpdjfv.supabase.co';

const supabaseAnonKey = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants.manifest2?.extra?.expoClient?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dWV1YmNhcHBmaXlrdnBkamZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTIyNTgsImV4cCI6MjA2NjE2ODI1OH0.xcLOBVDZW2FEyA4xjC54EkvtiL6IsY0D45HE4m_IIpo';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Check environment configuration.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 