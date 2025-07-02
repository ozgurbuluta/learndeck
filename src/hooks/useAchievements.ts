import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Achievement {
  id: string;
  achievement_type: 'first_word' | 'study_streak_7' | 'word_master_10' | 'dedicated_learner_60';
  earned_at: Date;
  seen: boolean;
}

export const achievementDetails = {
  first_word: {
    title: 'First Word',
    description: 'Added your first word to the collection',
    icon: 'BookOpen',
    color: 'bg-blue-500'
  },
  study_streak_7: {
    title: 'Study Streak',
    description: 'Studied for 7 consecutive days',
    icon: 'Zap',
    color: 'bg-yellow-500'
  },
  word_master_10: {
    title: 'Word Master',
    description: 'Mastered 10 words',
    icon: 'Trophy',
    color: 'bg-green-500'
  },
  dedicated_learner_60: {
    title: 'Dedicated Learner',
    description: 'Spent over 60 minutes studying',
    icon: 'Clock',
    color: 'bg-purple-500'
  }
} as const;

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all achievements
  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      setAchievements(data.map(achievement => ({
        ...achievement,
        earned_at: new Date(achievement.earned_at)
      })));
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check for new achievements
  const checkAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('check_and_grant_achievements', { p_user_id: user.id });

      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch the newly earned achievements
        const { data: newAchievementsData, error: newAchievementsError } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id)
          .eq('seen', false)
          .order('earned_at', { ascending: false });

        if (newAchievementsError) throw newAchievementsError;

        if (newAchievementsData) {
          setNewAchievements(newAchievementsData.map(achievement => ({
            ...achievement,
            earned_at: new Date(achievement.earned_at)
          })));
        }

        // Refresh all achievements
        await fetchAchievements();
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  // Mark achievements as seen
  const markAchievementsSeen = async () => {
    if (!user || newAchievements.length === 0) return;

    try {
      const { error } = await supabase
        .rpc('mark_achievements_seen', { p_user_id: user.id });

      if (error) throw error;

      setNewAchievements([]);
    } catch (error) {
      console.error('Error marking achievements as seen:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  return {
    achievements,
    newAchievements,
    loading,
    checkAchievements,
    markAchievementsSeen
  };
} 