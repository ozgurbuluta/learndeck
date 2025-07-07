import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: 'first_word' | 'study_streak_7' | 'word_master_10' | 'dedicated_learner_60';
  earned_at: Date;
  seen: boolean;
}

export const achievementDetails = {
  first_word: {
    title: 'First Word',
    description: 'Added your first word',
    icon: 'BookOpen',
  },
  study_streak_7: {
    title: 'Study Streak',
    description: 'Studied for 7 days',
    icon: 'Flame',
  },
  word_master_10: {
    title: 'Word Master',
    description: 'Mastered 10 words',
    icon: 'Trophy',
  },
  dedicated_learner_60: {
    title: 'Dedicated Learner',
    description: 'Studied for 60 minutes',
    icon: 'Clock',
  },
} as const;

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Check for new achievements before fetching
      await supabase.rpc('check_and_grant_achievements', { p_user_id: user.id });

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      setAchievements(
        data.map((ach) => ({
          ...ach,
          earned_at: new Date(ach.earned_at),
        }))
      );
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    loading,
    refetch: fetchAchievements,
  };
} 