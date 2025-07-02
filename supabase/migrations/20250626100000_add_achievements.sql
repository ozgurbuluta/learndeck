/*
  # Add Achievements System

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `achievement_type` (text, the type of achievement)
      - `earned_at` (timestamptz, when the achievement was earned)
      - `seen` (boolean, whether the user has seen the notification)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on achievements table
    - Add policies for users to manage their own achievements

  3. Functions
    - Function to check and grant achievements
    - Function to mark achievements as seen
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL CHECK (
    achievement_type IN (
      'first_word',
      'study_streak_7',
      'word_master_10',
      'dedicated_learner_60'
    )
  ),
  earned_at timestamptz DEFAULT now() NOT NULL,
  seen boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  -- Ensure users can only earn each achievement once
  UNIQUE(user_id, achievement_type)
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON achievements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON achievements(user_id);
CREATE INDEX IF NOT EXISTS achievements_type_idx ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS achievements_earned_at_idx ON achievements(earned_at DESC);

-- Function to check and grant achievements
CREATE OR REPLACE FUNCTION check_and_grant_achievements(p_user_id uuid)
RETURNS TABLE (achievement_type text, newly_earned boolean) AS $$
DECLARE
  total_words integer;
  mastered_words integer;
  study_streak integer;
  total_study_time integer;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO total_words
  FROM words
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO mastered_words
  FROM words
  WHERE user_id = p_user_id AND difficulty = 'mastered';

  SELECT COALESCE(study_streak, 0), COALESCE(total_study_time, 0)
  INTO study_streak, total_study_time
  FROM profiles
  WHERE id = p_user_id;

  -- Check and grant First Word achievement
  IF total_words > 0 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'first_word')
    ON CONFLICT (user_id, achievement_type) DO NOTHING
    RETURNING achievement_type, true INTO achievement_type, newly_earned;

    RETURN NEXT;
  END IF;

  -- Check and grant Study Streak achievement
  IF study_streak >= 7 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'study_streak_7')
    ON CONFLICT (user_id, achievement_type) DO NOTHING
    RETURNING achievement_type, true INTO achievement_type, newly_earned;

    RETURN NEXT;
  END IF;

  -- Check and grant Word Master achievement
  IF mastered_words >= 10 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'word_master_10')
    ON CONFLICT (user_id, achievement_type) DO NOTHING
    RETURNING achievement_type, true INTO achievement_type, newly_earned;

    RETURN NEXT;
  END IF;

  -- Check and grant Dedicated Learner achievement
  IF total_study_time >= 60 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'dedicated_learner_60')
    ON CONFLICT (user_id, achievement_type) DO NOTHING
    RETURNING achievement_type, true INTO achievement_type, newly_earned;

    RETURN NEXT;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark achievements as seen
CREATE OR REPLACE FUNCTION mark_achievements_seen(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE achievements
  SET seen = true
  WHERE user_id = p_user_id AND seen = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 