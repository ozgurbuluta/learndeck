/*
  # Fix Achievement Logic

  The previous migration had issues with the FOUND variable not being set correctly
  for INSERT ... ON CONFLICT DO NOTHING statements. This fixes the logic to properly
  detect when achievements are earned.
*/

-- Create or replace the fixed achievement checking function
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
  achievement_exists boolean;
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

  -- HELPER FUNCTION TO CHECK AND GRANT ACHIEVEMENTS
  -- This function properly handles the INSERT...ON CONFLICT logic
  
  -- First Word
  IF total_words > 0 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'first_word') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'first_word');
      
      RETURN QUERY SELECT 'first_word'::text, true;
    END IF;
  END IF;

  -- Study Streak 7
  IF study_streak >= 7 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'study_streak_7') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'study_streak_7');
      
      RETURN QUERY SELECT 'study_streak_7'::text, true;
    END IF;
  END IF;

  -- Word Master 10
  IF mastered_words >= 10 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'word_master_10') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'word_master_10');
      
      RETURN QUERY SELECT 'word_master_10'::text, true;
    END IF;
  END IF;

  -- Dedicated Learner 60
  IF total_study_time >= 60 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'dedicated_learner_60') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'dedicated_learner_60');
      
      RETURN QUERY SELECT 'dedicated_learner_60'::text, true;
    END IF;
  END IF;

  -- Early Bird
  IF morning_sessions >= 20 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'early_bird') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'early_bird');
      
      RETURN QUERY SELECT 'early_bird'::text, true;
    END IF;
  END IF;

  -- Night Owl
  IF evening_sessions >= 20 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'night_owl') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'night_owl');
      
      RETURN QUERY SELECT 'night_owl'::text, true;
    END IF;
  END IF;

  -- Consistent Learner
  IF study_streak >= 14 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'consistent_learner') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'consistent_learner');
      
      RETURN QUERY SELECT 'consistent_learner'::text, true;
    END IF;
  END IF;

  -- Study Streak 30
  IF study_streak >= 30 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'study_streak_30') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'study_streak_30');
      
      RETURN QUERY SELECT 'study_streak_30'::text, true;
    END IF;
  END IF;

  -- Study Streak 100
  IF study_streak >= 100 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'study_streak_100') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'study_streak_100');
      
      RETURN QUERY SELECT 'study_streak_100'::text, true;
    END IF;
  END IF;

  -- Word Master 50
  IF mastered_words >= 50 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'word_master_50') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'word_master_50');
      
      RETURN QUERY SELECT 'word_master_50'::text, true;
    END IF;
  END IF;

  -- Word Master 100
  IF mastered_words >= 100 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'word_master_100') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'word_master_100');
      
      RETURN QUERY SELECT 'word_master_100'::text, true;
    END IF;
  END IF;

  -- Word Master 500
  IF mastered_words >= 500 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'word_master_500') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'word_master_500');
      
      RETURN QUERY SELECT 'word_master_500'::text, true;
    END IF;
  END IF;

  -- Word Master 1000
  IF mastered_words >= 1000 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'word_master_1000') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'word_master_1000');
      
      RETURN QUERY SELECT 'word_master_1000'::text, true;
    END IF;
  END IF;

  -- Time Investor (300 min)
  IF total_study_time >= 300 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'dedicated_learner_300') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'dedicated_learner_300');
      
      RETURN QUERY SELECT 'dedicated_learner_300'::text, true;
    END IF;
  END IF;

  -- Study Enthusiast (1000 min)
  IF total_study_time >= 1000 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'dedicated_learner_1000') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'dedicated_learner_1000');
      
      RETURN QUERY SELECT 'dedicated_learner_1000'::text, true;
    END IF;
  END IF;

  -- Marathon Learner
  IF max_session_time >= 60 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'marathon_learner') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'marathon_learner');
      
      RETURN QUERY SELECT 'marathon_learner'::text, true;
    END IF;
  END IF;

  -- Accuracy Champion
  IF overall_accuracy >= 90 AND total_reviews >= 100 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'accuracy_champion') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'accuracy_champion');
      
      RETURN QUERY SELECT 'accuracy_champion'::text, true;
    END IF;
  END IF;

  -- Consistent Accuracy
  IF consecutive_accurate_sessions >= 20 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'consistent_accuracy') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'consistent_accuracy');
      
      RETURN QUERY SELECT 'consistent_accuracy'::text, true;
    END IF;
  END IF;

  -- Organizer
  IF total_folders >= 5 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'organizer') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'organizer');
      
      RETURN QUERY SELECT 'organizer'::text, true;
    END IF;
  END IF;

  -- Folder Master
  IF populated_folders >= 15 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'folder_master') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'folder_master');
      
      RETURN QUERY SELECT 'folder_master'::text, true;
    END IF;
  END IF;

  -- Category Expert
  IF words_in_folders >= 500 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'category_expert') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'category_expert');
      
      RETURN QUERY SELECT 'category_expert'::text, true;
    END IF;
  END IF;

  -- Session Warrior
  IF total_sessions >= 50 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'session_warrior') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'session_warrior');
      
      RETURN QUERY SELECT 'session_warrior'::text, true;
    END IF;
  END IF;

  -- Focused Learner
  IF focused_sessions >= 10 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'focused_learner') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'focused_learner');
      
      RETURN QUERY SELECT 'focused_learner'::text, true;
    END IF;
  END IF;

  -- Review Champion
  IF total_reviews >= 500 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'review_champion') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'review_champion');
      
      RETURN QUERY SELECT 'review_champion'::text, true;
    END IF;
  END IF;

  -- Review Master
  IF total_reviews >= 1000 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'review_master') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'review_master');
      
      RETURN QUERY SELECT 'review_master'::text, true;
    END IF;
  END IF;

  -- Review Legend
  IF total_reviews >= 5000 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'review_legend') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'review_legend');
      
      RETURN QUERY SELECT 'review_legend'::text, true;
    END IF;
  END IF;

  -- Comeback Kid
  IF days_since_last_session >= 7 AND total_sessions > 0 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'comeback_kid') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'comeback_kid');
      
      RETURN QUERY SELECT 'comeback_kid'::text, true;
    END IF;
  END IF;

  -- Speed Learner
  IF single_day_mastered >= 10 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'speed_learner') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'speed_learner');
      
      RETURN QUERY SELECT 'speed_learner'::text, true;
    END IF;
  END IF;

  -- Completionist
  IF achievement_count >= 20 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'completionist') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'completionist');
      
      RETURN QUERY SELECT 'completionist'::text, true;
    END IF;
  END IF;

  -- Perfectionist (100% accuracy in a session)
  IF EXISTS (
    SELECT 1 FROM study_sessions
    WHERE user_id = p_user_id 
      AND completed_at IS NOT NULL
      AND words_studied > 0
      AND correct_answers = words_studied
  ) THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'perfectionist') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'perfectionist');
      
      RETURN QUERY SELECT 'perfectionist'::text, true;
    END IF;
  END IF;

  -- Daily Reviewer
  IF study_streak >= 30 AND total_sessions >= 30 THEN
    SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'daily_reviewer') INTO achievement_exists;
    
    IF NOT achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'daily_reviewer');
      
      RETURN QUERY SELECT 'daily_reviewer'::text, true;
    END IF;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_and_grant_achievements TO authenticated;