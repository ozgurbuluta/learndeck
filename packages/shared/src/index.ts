import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Runtime-configurable env — read from process.env in web, expo-constants in mobile.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

export * from './types';
// Future: export hooks and utils once migrated. 
export * from './utils/studyAlgorithm';