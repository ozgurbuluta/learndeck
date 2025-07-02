import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      words: {
        Row: {
          id: string;
          user_id: string;
          word: string;
          definition: string;
          created_at: string;
          last_reviewed: string | null;
          review_count: number;
          correct_count: number;
          difficulty: 'new' | 'learning' | 'review' | 'mastered';
          next_review: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word: string;
          definition: string;
          created_at?: string;
          last_reviewed?: string | null;
          review_count?: number;
          correct_count?: number;
          difficulty?: 'new' | 'learning' | 'review' | 'mastered';
          next_review?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          word?: string;
          definition?: string;
          created_at?: string;
          last_reviewed?: string | null;
          review_count?: number;
          correct_count?: number;
          difficulty?: 'new' | 'learning' | 'review' | 'mastered';
          next_review?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          bio: string | null;
          learning_goal: number;
          preferred_difficulty: 'new' | 'learning' | 'review' | 'mastered';
          study_streak: number;
          total_study_time: number;
          favorite_categories: string[];
          timezone: string;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          learning_goal?: number;
          preferred_difficulty?: 'new' | 'learning' | 'review' | 'mastered';
          study_streak?: number;
          total_study_time?: number;
          favorite_categories?: string[];
          timezone?: string;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          learning_goal?: number;
          preferred_difficulty?: 'new' | 'learning' | 'review' | 'mastered';
          study_streak?: number;
          total_study_time?: number;
          favorite_categories?: string[];
          timezone?: string;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};