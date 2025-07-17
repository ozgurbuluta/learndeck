/*
  # Expand Achievements System

  1. Update achievement_type constraint to support new achievement types
  2. Update check_and_grant_achievements function to handle new achievements
  3. Add new achievement tracking logic based on user data

  New Achievement Categories:
  - Study habits: early_bird, night_owl, consistent_learner, study_streak_30, study_streak_100
  - Word mastery: word_master_50, word_master_100, word_master_500, word_master_1000
  - Study volume: dedicated_learner_300, dedicated_learner_1000, marathon_learner
  - Accuracy: perfectionist, accuracy_champion, consistent_accuracy
  - Organization: organizer, folder_master, category_expert
  - Session volume: session_warrior, daily_reviewer, focused_learner
  - Review milestones: review_champion, review_master, review_legend
  - Special: comeback_kid, speed_learner, completionist
*/

-- Drop the existing constraint and add new one with expanded types
ALTER TABLE achievements 
DROP CONSTRAINT IF EXISTS achievements_achievement_type_check;

ALTER TABLE achievements 
ADD CONSTRAINT achievements_achievement_type_check 
CHECK (
  achievement_type IN (
    -- Existing achievements
    'first_word', 'study_streak_7', 'word_master_10', 'dedicated_learner_60',
    -- Study habits
    'early_bird', 'night_owl', 'consistent_learner', 'study_streak_30', 'study_streak_100',
    -- Word mastery
    'word_master_50', 'word_master_100', 'word_master_500', 'word_master_1000',
    -- Study volume
    'dedicated_learner_300', 'dedicated_learner_1000', 'marathon_learner',
    -- Accuracy achievements
    'perfectionist', 'accuracy_champion', 'consistent_accuracy',
    -- Folder organization
    'organizer', 'folder_master', 'category_expert',
    -- Study sessions
    'session_warrior', 'daily_reviewer', 'focused_learner',
    -- Review milestones
    'review_champion', 'review_master', 'review_legend',
    -- Special achievements
    'comeback_kid', 'speed_learner', 'completionist'
  )
);

-- Create or replace the enhanced achievement checking function
CREATE OR REPLACE FUNCTION check_and_grant_achievements(p_user_id uuid)
RETURNS TABLE (achievement_type text, newly_earned boolean) AS $$
DECLARE
  total_words integer;
  mastered_words integer;
  study_streak integer;
  total_study_time integer;
  total_folders integer;
  total_reviews integer;
  total_sessions integer;
  total_correct integer;
  overall_accuracy decimal;
  achievement_count integer;
  morning_sessions integer;
  evening_sessions integer;
  words_in_folders integer;
  populated_folders integer;
  max_session_time integer;
  recent_session_date date;
  days_since_last_session integer;
  single_day_mastered integer;
  consecutive_accurate_sessions integer;
  high_accuracy_reviews integer;
  focused_sessions integer;
  consecutive_review_days integer;
BEGIN
  -- Get basic user stats
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

  -- Get folder stats
  SELECT COUNT(*) INTO total_folders
  FROM folders
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO words_in_folders
  FROM word_folders wf
  JOIN words w ON wf.word_id = w.id
  WHERE w.user_id = p_user_id;

  SELECT COUNT(*) INTO populated_folders
  FROM (
    SELECT f.id
    FROM folders f
    JOIN word_folders wf ON f.id = wf.folder_id
    JOIN words w ON wf.word_id = w.id
    WHERE w.user_id = p_user_id
    GROUP BY f.id
    HAVING COUNT(wf.word_id) >= 10
  ) subq;

  -- Get study session stats
  SELECT COUNT(*), COALESCE(SUM(correct_answers), 0), COALESCE(SUM(words_studied), 0)
  INTO total_sessions, total_correct, total_reviews
  FROM study_sessions
  WHERE user_id = p_user_id AND completed_at IS NOT NULL;

  -- Calculate overall accuracy
  IF total_reviews > 0 THEN
    overall_accuracy := (total_correct::decimal / total_reviews) * 100;
  ELSE
    overall_accuracy := 0;
  END IF;

  -- Get time-based session stats
  SELECT COUNT(*) INTO morning_sessions
  FROM study_sessions
  WHERE user_id = p_user_id 
    AND completed_at IS NOT NULL
    AND EXTRACT(HOUR FROM completed_at) < 9;

  SELECT COUNT(*) INTO evening_sessions
  FROM study_sessions
  WHERE user_id = p_user_id 
    AND completed_at IS NOT NULL
    AND EXTRACT(HOUR FROM completed_at) >= 21;

  -- Get max session time
  SELECT COALESCE(MAX(total_time_minutes), 0) INTO max_session_time
  FROM study_sessions
  WHERE user_id = p_user_id AND completed_at IS NOT NULL;

  -- Get recent session info for comeback detection
  SELECT MAX(completed_at::date) INTO recent_session_date
  FROM study_sessions
  WHERE user_id = p_user_id AND completed_at IS NOT NULL;

  IF recent_session_date IS NOT NULL THEN
    days_since_last_session := CURRENT_DATE - recent_session_date;
  ELSE
    days_since_last_session := 999; -- Large number if no sessions
  END IF;

  -- Get single day mastery (simplified - based on mastered words creation date)
  SELECT COUNT(*) INTO single_day_mastered
  FROM words
  WHERE user_id = p_user_id 
    AND difficulty = 'mastered'
    AND created_at::date = CURRENT_DATE;

  -- Get focused sessions (sessions with 20+ words)
  SELECT COUNT(*) INTO focused_sessions
  FROM study_sessions
  WHERE user_id = p_user_id 
    AND completed_at IS NOT NULL
    AND words_studied >= 20;

  -- Get high accuracy reviews (90%+ accuracy over 100 reviews)
  SELECT COUNT(*) INTO high_accuracy_reviews
  FROM study_sessions
  WHERE user_id = p_user_id 
    AND completed_at IS NOT NULL
    AND words_studied >= 10
    AND (correct_answers::decimal / words_studied) >= 0.9;

  -- Get consecutive accurate sessions (80%+ accuracy - simplified)
  SELECT COUNT(*) INTO consecutive_accurate_sessions
  FROM study_sessions
  WHERE user_id = p_user_id 
    AND completed_at IS NOT NULL
    AND words_studied > 0
    AND (correct_answers::decimal / words_studied) >= 0.8;

  -- Get current achievement count
  SELECT COUNT(*) INTO achievement_count
  FROM achievements
  WHERE user_id = p_user_id;

  -- ORIGINAL ACHIEVEMENTS (maintained for backward compatibility)
  
  -- First Word
  IF total_words > 0 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'first_word')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'first_word'::text, true;
    END IF;
  END IF;

  -- Study Streak 7
  IF study_streak >= 7 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'study_streak_7')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'study_streak_7'::text, true;
    END IF;
  END IF;

  -- Word Master 10
  IF mastered_words >= 10 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'word_master_10')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'word_master_10'::text, true;
    END IF;
  END IF;

  -- Dedicated Learner 60
  IF total_study_time >= 60 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'dedicated_learner_60')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'dedicated_learner_60'::text, true;
    END IF;
  END IF;

  -- NEW ACHIEVEMENTS

  -- Study Habits
  IF morning_sessions >= 20 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'early_bird')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'early_bird'::text, true;
    END IF;
  END IF;

  IF evening_sessions >= 20 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'night_owl')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'night_owl'::text, true;
    END IF;
  END IF;

  IF study_streak >= 14 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'consistent_learner')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'consistent_learner'::text, true;
    END IF;
  END IF;

  IF study_streak >= 30 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'study_streak_30')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'study_streak_30'::text, true;
    END IF;
  END IF;

  IF study_streak >= 100 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'study_streak_100')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'study_streak_100'::text, true;
    END IF;
  END IF;

  -- Word Mastery
  IF mastered_words >= 50 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'word_master_50')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'word_master_50'::text, true;
    END IF;
  END IF;

  IF mastered_words >= 100 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'word_master_100')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'word_master_100'::text, true;
    END IF;
  END IF;

  IF mastered_words >= 500 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'word_master_500')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'word_master_500'::text, true;
    END IF;
  END IF;

  IF mastered_words >= 1000 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'word_master_1000')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'word_master_1000'::text, true;
    END IF;
  END IF;

  -- Study Volume
  IF total_study_time >= 300 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'dedicated_learner_300')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'dedicated_learner_300'::text, true;
    END IF;
  END IF;

  IF total_study_time >= 1000 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'dedicated_learner_1000')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'dedicated_learner_1000'::text, true;
    END IF;
  END IF;

  IF max_session_time >= 60 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'marathon_learner')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'marathon_learner'::text, true;
    END IF;
  END IF;

  -- Accuracy (simplified logic)
  IF overall_accuracy >= 90 AND total_reviews >= 100 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'accuracy_champion')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'accuracy_champion'::text, true;
    END IF;
  END IF;

  IF consecutive_accurate_sessions >= 20 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'consistent_accuracy')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'consistent_accuracy'::text, true;
    END IF;
  END IF;

  -- Organization
  IF total_folders >= 5 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'organizer')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'organizer'::text, true;
    END IF;
  END IF;

  IF populated_folders >= 15 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'folder_master')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'folder_master'::text, true;
    END IF;
  END IF;

  IF words_in_folders >= 500 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'category_expert')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'category_expert'::text, true;
    END IF;
  END IF;

  -- Sessions
  IF total_sessions >= 50 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'session_warrior')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'session_warrior'::text, true;
    END IF;
  END IF;

  IF focused_sessions >= 10 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'focused_learner')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'focused_learner'::text, true;
    END IF;
  END IF;

  -- Review Milestones
  IF total_reviews >= 500 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'review_champion')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'review_champion'::text, true;
    END IF;
  END IF;

  IF total_reviews >= 1000 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'review_master')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'review_master'::text, true;
    END IF;
  END IF;

  IF total_reviews >= 5000 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'review_legend')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'review_legend'::text, true;
    END IF;
  END IF;

  -- Special Achievements
  IF days_since_last_session >= 7 AND total_sessions > 0 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'comeback_kid')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'comeback_kid'::text, true;
    END IF;
  END IF;

  IF single_day_mastered >= 10 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'speed_learner')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'speed_learner'::text, true;
    END IF;
  END IF;

  IF achievement_count >= 20 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'completionist')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'completionist'::text, true;
    END IF;
  END IF;

  -- Check for perfectionist (100% accuracy in a session)
  IF EXISTS (
    SELECT 1 FROM study_sessions
    WHERE user_id = p_user_id 
      AND completed_at IS NOT NULL
      AND words_studied > 0
      AND correct_answers = words_studied
  ) THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'perfectionist')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'perfectionist'::text, true;
    END IF;
  END IF;

  -- Daily reviewer (simplified - based on session count and streak)
  IF study_streak >= 30 AND total_sessions >= 30 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'daily_reviewer')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'daily_reviewer'::text, true;
    END IF;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_and_grant_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION mark_achievements_seen TO authenticated;