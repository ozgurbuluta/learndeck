/*
  # Add Failed Difficulty Support

  1. Updates
    - Update words table difficulty constraint to include 'failed'
    - Update profiles table preferred_difficulty constraint to include 'failed'

  2. Description
    - The 'failed' difficulty is for words that consistently perform poorly
    - This allows better tracking and targeted practice of difficult vocabulary
*/

-- Update words table constraint to include 'failed'
ALTER TABLE words 
DROP CONSTRAINT IF EXISTS words_difficulty_check;

ALTER TABLE words 
ADD CONSTRAINT words_difficulty_check 
CHECK (difficulty IN ('new', 'learning', 'review', 'mastered', 'failed'));

-- Update profiles table constraint to include 'failed'
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_preferred_difficulty_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_preferred_difficulty_check
CHECK (preferred_difficulty IN ('new', 'learning', 'review', 'mastered', 'failed'));
