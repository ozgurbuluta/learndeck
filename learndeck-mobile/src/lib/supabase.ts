import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  (Constants.expoConfig?.extra?.supabaseUrl as string | undefined) ||
  '';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined) ||
  '';

function validateSupabaseConfig(url: string, key: string) {
  const problems: string[] = [];
  if (!url) problems.push('EXPO_PUBLIC_SUPABASE_URL is missing');
  if (!key) problems.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is missing');
  if (url && !/^https?:\/\//i.test(url)) problems.push('EXPO_PUBLIC_SUPABASE_URL must start with http(s)://');
  if (key && key.split('.').length < 2) problems.push('EXPO_PUBLIC_SUPABASE_ANON_KEY looks malformed');
  if (problems.length) {
    throw new Error(`Supabase config error: ${problems.join('; ')}. Configure via .env (EXPO_PUBLIC_*) or app config extras (app.config.ts).`);
  }
}

validateSupabaseConfig(supabaseUrl, supabaseAnonKey);

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});