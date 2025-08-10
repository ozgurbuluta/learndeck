// Shared types placeholder. Update after migration.
export type TODO = unknown;

export interface Word {
  id: string;
  user_id: string;
  word: string;
  definition: string;
  article?: string;
  created_at: Date;
  last_reviewed: Date | null;
  review_count: number;
  correct_count: number;
  difficulty: 'new' | 'learning' | 'review' | 'mastered' | 'failed';
  next_review: Date;
  folders?: Folder[];
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
  word_count?: number;
}

export interface WordFolder {
  id: string;
  word_id: string;
  folder_id: string;
  created_at: Date;
}

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  learning_goal: number;
  preferred_difficulty: 'new' | 'learning' | 'review' | 'mastered' | 'failed';
  study_streak: number;
  total_study_time: number;
  favorite_categories: string[];
  timezone: string;
  notifications_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StudySession {
  id: string;
  user_id: string;
  folder_id: string | null;
  study_type: StudyType;
  words_studied: number;
  correct_answers: number;
  total_time_minutes: number;
  started_at: Date;
  completed_at: Date | null;
  created_at: Date;
}

export interface RecentStudyOption {
  id: string;
  user_id: string;
  folder_id: string | null;
  study_type: StudyType;
  last_used_at: Date;
  use_count: number;
  created_at: Date;
  folder?: Folder;
}

export type StudyType = 'all' | 'new' | 'review' | 'learning' | 'mastered' | 'failed';

export interface StudyConfig {
  folderId: string | null;
  folderName: string;
  studyType: StudyType;
  wordCount: number;
}

export interface AppState {
  words: Word[];
  currentStudySession: StudySession | null;
  view: 'dashboard' | 'add-word' | 'study' | 'progress' | 'word-list' | 'profile';
}

export interface User {
  id: string;
  email: string;
}

export interface ExtractedWord {
  word: string;
  definition: string;
  article?: string;
}

export interface ImportResult {
  success: boolean;
  words?: ExtractedWord[];
  savedCount?: number;
  error?: string;
  isPreview?: boolean;
} 