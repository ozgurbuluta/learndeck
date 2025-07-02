/*
  # Create words table for vocabulary app

  1. New Tables
    - `words`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `word` (text, the vocabulary word)
      - `definition` (text, the word's definition)
      - `created_at` (timestamptz, when the word was added)
      - `last_reviewed` (timestamptz, when the word was last studied)
      - `review_count` (integer, number of times reviewed)
      - `correct_count` (integer, number of correct answers)
      - `difficulty` (text, spaced repetition difficulty level)
      - `next_review` (timestamptz, when the word should be reviewed next)

  2. Security
    - Enable RLS on `words` table
    - Add policy for users to manage their own words
    - Add policy for users to read their own words
    - Add policy for users to insert their own words
    - Add policy for users to update their own words
    - Add policy for users to delete their own words
*/

-- Create the words table
CREATE TABLE IF NOT EXISTS words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word text NOT NULL,
  definition text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_reviewed timestamptz,
  review_count integer DEFAULT 0 NOT NULL,
  correct_count integer DEFAULT 0 NOT NULL,
  difficulty text DEFAULT 'new' NOT NULL CHECK (difficulty IN ('new', 'learning', 'review', 'mastered')),
  next_review timestamptz DEFAULT (now() + interval '1 day') NOT NULL
);

-- Enable Row Level Security
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Create policies for the words table
CREATE POLICY "Users can read their own words"
  ON words
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own words"
  ON words
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own words"
  ON words
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own words"
  ON words
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS words_user_id_idx ON words(user_id);
CREATE INDEX IF NOT EXISTS words_next_review_idx ON words(next_review);
CREATE INDEX IF NOT EXISTS words_difficulty_idx ON words(difficulty);
CREATE INDEX IF NOT EXISTS words_created_at_idx ON words(created_at DESC);