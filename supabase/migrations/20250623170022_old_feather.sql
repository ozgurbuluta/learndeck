/*
  # Add Study Sessions and Recent Study Options

  1. New Tables
    - `study_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `folder_id` (uuid, references folders, nullable)
      - `study_type` (text, constrained values)
      - `words_studied` (integer)
      - `correct_answers` (integer)
      - `total_time_minutes` (integer)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
    
    - `recent_study_options`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `folder_id` (uuid, references folders, nullable)
      - `study_type` (text, constrained values)
      - `last_used_at` (timestamptz)
      - `use_count` (integer)
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, folder_id, study_type)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Performance
    - Add indexes for user_id, timestamps, and frequently queried columns
*/

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  study_type text NOT NULL CHECK (study_type IN ('all', 'new', 'review', 'learning', 'mastered', 'failed')),
  words_studied integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  total_time_minutes integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create recent_study_options table
CREATE TABLE IF NOT EXISTS recent_study_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  study_type text NOT NULL CHECK (study_type IN ('all', 'new', 'review', 'learning', 'mastered', 'failed')),
  last_used_at timestamptz NOT NULL DEFAULT now(),
  use_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, folder_id, study_type)
);

-- Enable RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_study_options ENABLE ROW LEVEL SECURITY;

-- Create policies for study_sessions
CREATE POLICY "Users can read own study sessions"
  ON study_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON study_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
  ON study_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sessions"
  ON study_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for recent_study_options
CREATE POLICY "Users can read own recent study options"
  ON recent_study_options
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recent study options"
  ON recent_study_options
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recent study options"
  ON recent_study_options
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recent study options"
  ON recent_study_options
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_started_at_idx ON study_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS study_sessions_folder_id_idx ON study_sessions(folder_id);

CREATE INDEX IF NOT EXISTS recent_study_options_user_id_idx ON recent_study_options(user_id);
CREATE INDEX IF NOT EXISTS recent_study_options_last_used_idx ON recent_study_options(last_used_at DESC);
CREATE INDEX IF NOT EXISTS recent_study_options_use_count_idx ON recent_study_options(use_count DESC);