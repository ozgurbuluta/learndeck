export interface Word {
  id: string;
  user_id: string;
  word: string;
  definition: string;
  created_at: string;
  last_reviewed: string | null;
  review_count: number;
  correct_count: number;
  difficulty: 'new' | 'learning' | 'review' | 'mastered' | 'failed';
  next_review: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  study_streak: number;
  total_study_time: number;
  learning_goal: number;
  notification_preferences: {
    daily_reminder: boolean;
    study_streak: boolean;
    achievement_unlocked: boolean;
  };
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: 'first_word' | 'study_streak_7' | 'word_master_10' | 'dedicated_learner_60';
  earned_at: string;
  seen: boolean;
  created_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}