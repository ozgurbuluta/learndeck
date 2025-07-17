import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Achievement {
  id: string;
  achievement_type: 
    // Existing achievements
    'first_word' | 'study_streak_7' | 'word_master_10' | 'dedicated_learner_60' |
    // Study habits
    'early_bird' | 'night_owl' | 'consistent_learner' | 'study_streak_30' | 'study_streak_100' |
    // Word mastery
    'word_master_50' | 'word_master_100' | 'word_master_500' | 'word_master_1000' |
    // Study volume
    'dedicated_learner_300' | 'dedicated_learner_1000' | 'marathon_learner' |
    // Accuracy achievements
    'perfectionist' | 'accuracy_champion' | 'consistent_accuracy' |
    // Folder organization
    'organizer' | 'folder_master' | 'category_expert' |
    // Study sessions
    'session_warrior' | 'daily_reviewer' | 'focused_learner' |
    // Review milestones
    'review_champion' | 'review_master' | 'review_legend' |
    // Special achievements
    'comeback_kid' | 'speed_learner' | 'completionist';
  earned_at: Date;
  seen: boolean;
}

export const achievementDetails = {
  // Existing achievements
  first_word: {
    title: 'First Word',
    description: 'Added your first word to the collection',
    icon: 'BookOpen',
    color: 'bg-blue-500',
    category: 'milestone'
  },
  study_streak_7: {
    title: 'Study Streak',
    description: 'Studied for 7 consecutive days',
    icon: 'Zap',
    color: 'bg-yellow-500',
    category: 'habit'
  },
  word_master_10: {
    title: 'Word Master',
    description: 'Mastered 10 words',
    icon: 'Trophy',
    color: 'bg-green-500',
    category: 'mastery'
  },
  dedicated_learner_60: {
    title: 'Dedicated Learner',
    description: 'Spent over 60 minutes studying',
    icon: 'Clock',
    color: 'bg-purple-500',
    category: 'dedication'
  },
  
  // Study habits
  early_bird: {
    title: 'Early Bird',
    description: 'Completed 20 study sessions before 9 AM',
    icon: 'Sunrise',
    color: 'bg-orange-500',
    category: 'habit'
  },
  night_owl: {
    title: 'Night Owl',
    description: 'Completed 20 study sessions after 9 PM',
    icon: 'Moon',
    color: 'bg-indigo-500',
    category: 'habit'
  },
  consistent_learner: {
    title: 'Consistent Learner',
    description: 'Studied every day for 14 consecutive days',
    icon: 'Calendar',
    color: 'bg-teal-500',
    category: 'habit'
  },
  study_streak_30: {
    title: 'Study Streak Champion',
    description: 'Studied for 30 consecutive days',
    icon: 'Flame',
    color: 'bg-red-500',
    category: 'habit'
  },
  study_streak_100: {
    title: 'Study Streak Legend',
    description: 'Studied for 100 consecutive days',
    icon: 'Crown',
    color: 'bg-yellow-600',
    category: 'habit'
  },
  
  // Word mastery
  word_master_50: {
    title: 'Word Scholar',
    description: 'Mastered 50 words',
    icon: 'GraduationCap',
    color: 'bg-green-600',
    category: 'mastery'
  },
  word_master_100: {
    title: 'Word Expert',
    description: 'Mastered 100 words',
    icon: 'Award',
    color: 'bg-emerald-500',
    category: 'mastery'
  },
  word_master_500: {
    title: 'Word Virtuoso',
    description: 'Mastered 500 words',
    icon: 'Star',
    color: 'bg-amber-500',
    category: 'mastery'
  },
  word_master_1000: {
    title: 'Word Grandmaster',
    description: 'Mastered 1000 words',
    icon: 'Sparkles',
    color: 'bg-yellow-500',
    category: 'mastery'
  },
  
  // Study volume
  dedicated_learner_300: {
    title: 'Time Investor',
    description: 'Spent over 300 minutes studying',
    icon: 'Clock',
    color: 'bg-purple-600',
    category: 'dedication'
  },
  dedicated_learner_1000: {
    title: 'Study Enthusiast',
    description: 'Spent over 1000 minutes studying',
    icon: 'Timer',
    color: 'bg-violet-500',
    category: 'dedication'
  },
  marathon_learner: {
    title: 'Marathon Learner',
    description: 'Completed a 60+ minute study session',
    icon: 'Zap',
    color: 'bg-pink-500',
    category: 'dedication'
  },
  
  // Accuracy achievements
  perfectionist: {
    title: 'Perfectionist',
    description: 'Achieved 100% accuracy in a study session',
    icon: 'CheckCircle',
    color: 'bg-cyan-500',
    category: 'accuracy'
  },
  accuracy_champion: {
    title: 'Accuracy Champion',
    description: 'Maintained 90%+ accuracy over 100 reviews',
    icon: 'Target',
    color: 'bg-blue-600',
    category: 'accuracy'
  },
  consistent_accuracy: {
    title: 'Consistent Accuracy',
    description: 'Achieved 80%+ accuracy in 20 consecutive sessions',
    icon: 'TrendingUp',
    color: 'bg-green-700',
    category: 'accuracy'
  },
  
  // Folder organization
  organizer: {
    title: 'Organizer',
    description: 'Created 5 folders to organize your words',
    icon: 'FolderOpen',
    color: 'bg-slate-500',
    category: 'organization'
  },
  folder_master: {
    title: 'Folder Master',
    description: 'Created 15 folders with 10+ words each',
    icon: 'Archive',
    color: 'bg-stone-500',
    category: 'organization'
  },
  category_expert: {
    title: 'Category Expert',
    description: 'Organized 500+ words across folders',
    icon: 'Grid3x3',
    color: 'bg-neutral-500',
    category: 'organization'
  },
  
  // Study sessions
  session_warrior: {
    title: 'Session Warrior',
    description: 'Completed 50 study sessions',
    icon: 'Swords',
    color: 'bg-red-600',
    category: 'volume'
  },
  daily_reviewer: {
    title: 'Daily Reviewer',
    description: 'Completed at least one review session daily for 30 days',
    icon: 'RefreshCw',
    color: 'bg-blue-700',
    category: 'habit'
  },
  focused_learner: {
    title: 'Focused Learner',
    description: 'Completed 10 sessions studying 20+ words each',
    icon: 'Eye',
    color: 'bg-indigo-600',
    category: 'focus'
  },
  
  // Review milestones
  review_champion: {
    title: 'Review Champion',
    description: 'Completed 500 word reviews',
    icon: 'RotateCcw',
    color: 'bg-emerald-600',
    category: 'volume'
  },
  review_master: {
    title: 'Review Master',
    description: 'Completed 1000 word reviews',
    icon: 'RepeatIcon',
    color: 'bg-teal-600',
    category: 'volume'
  },
  review_legend: {
    title: 'Review Legend',
    description: 'Completed 5000 word reviews',
    icon: 'Infinity',
    color: 'bg-cyan-600',
    category: 'volume'
  },
  
  // Special achievements
  comeback_kid: {
    title: 'Comeback Kid',
    description: 'Returned to study after a 7+ day break',
    icon: 'ArrowUp',
    color: 'bg-orange-600',
    category: 'resilience'
  },
  speed_learner: {
    title: 'Speed Learner',
    description: 'Mastered 10 words in a single day',
    icon: 'Zap',
    color: 'bg-lime-500',
    category: 'speed'
  },
  completionist: {
    title: 'Completionist',
    description: 'Earned 20 different achievements',
    icon: 'Medal',
    color: 'bg-yellow-500',
    category: 'completionist'
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