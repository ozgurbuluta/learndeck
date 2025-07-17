/*
  # Fix Ambiguous Column References

  The achievement function has ambiguous column references where variable names
  conflict with column names. This fixes the issue by using proper table aliases
  and renaming variables to avoid conflicts.
*/

-- Create or replace the fixed achievement checking function
CREATE OR REPLACE FUNCTION check_and_grant_achievements(p_user_id uuid)
RETURNS TABLE (achievement_type text, newly_earned boolean) AS $$
DECLARE
  v_total_words integer;
  v_mastered_words integer;
  v_study_streak integer;
  v_total_study_time integer;
  v_total_folders integer;
  v_total_reviews integer;
  v_total_sessions integer;
  v_total_correct integer;
  v_overall_accuracy decimal;
  v_achievement_count integer;
  v_morning_sessions integer;
  v_evening_sessions integer;
  v_words_in_folders integer;
  v_populated_folders integer;
  v_max_session_time integer;
  v_recent_session_date date;
  v_days_since_last_session integer;
  v_single_day_mastered integer;
  v_consecutive_accurate_sessions integer;
  v_high_accuracy_reviews integer;
  v_focused_sessions integer;
  v_consecutive_review_days integer;
  v_achievement_exists boolean;
BEGIN
  -- Get basic user stats
  SELECT COUNT(*) INTO v_total_words
  FROM words
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_mastered_words
  FROM words
  WHERE user_id = p_user_id AND difficulty = 'mastered';

  SELECT COALESCE(p.study_streak, 0), COALESCE(p.total_study_time, 0)
  INTO v_study_streak, v_total_study_time
  FROM profiles p
  WHERE p.id = p_user_id;

  -- Get folder stats
  SELECT COUNT(*) INTO v_total_folders
  FROM folders
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_words_in_folders
  FROM word_folders wf
  JOIN words w ON wf.word_id = w.id
  WHERE w.user_id = p_user_id;

  SELECT COUNT(*) INTO v_populated_folders
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
  SELECT COUNT(*), COALESCE(SUM(s.correct_answers), 0), COALESCE(SUM(s.words_studied), 0)
  INTO v_total_sessions, v_total_correct, v_total_reviews
  FROM study_sessions s
  WHERE s.user_id = p_user_id AND s.completed_at IS NOT NULL;

  -- Calculate overall accuracy
  IF v_total_reviews > 0 THEN
    v_overall_accuracy := (v_total_correct::decimal / v_total_reviews) * 100;
  ELSE
    v_overall_accuracy := 0;
  END IF;

  -- Get time-based session stats
  SELECT COUNT(*) INTO v_morning_sessions
  FROM study_sessions s
  WHERE s.user_id = p_user_id 
    AND s.completed_at IS NOT NULL
    AND EXTRACT(HOUR FROM s.completed_at) < 9;

  SELECT COUNT(*) INTO v_evening_sessions
  FROM study_sessions s
  WHERE s.user_id = p_user_id 
    AND s.completed_at IS NOT NULL
    AND EXTRACT(HOUR FROM s.completed_at) >= 21;

  -- Get max session time
  SELECT COALESCE(MAX(s.total_time_minutes), 0) INTO v_max_session_time
  FROM study_sessions s
  WHERE s.user_id = p_user_id AND s.completed_at IS NOT NULL;

  -- Get recent session info for comeback detection
  SELECT MAX(s.completed_at::date) INTO v_recent_session_date
  FROM study_sessions s
  WHERE s.user_id = p_user_id AND s.completed_at IS NOT NULL;

  IF v_recent_session_date IS NOT NULL THEN
    v_days_since_last_session := CURRENT_DATE - v_recent_session_date;
  ELSE
    v_days_since_last_session := 999; -- Large number if no sessions
  END IF;

  -- Get single day mastery (simplified - based on mastered words creation date)
  SELECT COUNT(*) INTO v_single_day_mastered
  FROM words w
  WHERE w.user_id = p_user_id 
    AND w.difficulty = 'mastered'
    AND w.created_at::date = CURRENT_DATE;

  -- Get focused sessions (sessions with 20+ words)
  SELECT COUNT(*) INTO v_focused_sessions
  FROM study_sessions s
  WHERE s.user_id = p_user_id 
    AND s.completed_at IS NOT NULL
    AND s.words_studied >= 20;

  -- Get high accuracy reviews (90%+ accuracy over 100 reviews)
  SELECT COUNT(*) INTO v_high_accuracy_reviews
  FROM study_sessions s
  WHERE s.user_id = p_user_id 
    AND s.completed_at IS NOT NULL
    AND s.words_studied >= 10
    AND (s.correct_answers::decimal / s.words_studied) >= 0.9;

  -- Get consecutive accurate sessions (80%+ accuracy - simplified)
  SELECT COUNT(*) INTO v_consecutive_accurate_sessions
  FROM study_sessions s
  WHERE s.user_id = p_user_id 
    AND s.completed_at IS NOT NULL
    AND s.words_studied > 0
    AND (s.correct_answers::decimal / s.words_studied) >= 0.8;

  -- Get current achievement count
  SELECT COUNT(*) INTO v_achievement_count
  FROM achievements a
  WHERE a.user_id = p_user_id;

  -- First Word
  IF v_total_words > 0 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'first_word') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'first_word');
      
      RETURN QUERY SELECT 'first_word'::text, true;
    END IF;
  END IF;

  -- Study Streak 7
  IF v_study_streak >= 7 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'study_streak_7') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'study_streak_7');
      
      RETURN QUERY SELECT 'study_streak_7'::text, true;
    END IF;
  END IF;

  -- Word Master 10
  IF v_mastered_words >= 10 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'word_master_10') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'word_master_10');
      
      RETURN QUERY SELECT 'word_master_10'::text, true;
    END IF;
  END IF;

  -- Dedicated Learner 60
  IF v_total_study_time >= 60 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'dedicated_learner_60') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'dedicated_learner_60');
      
      RETURN QUERY SELECT 'dedicated_learner_60'::text, true;
    END IF;
  END IF;

  -- Early Bird
  IF v_morning_sessions >= 20 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'early_bird') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'early_bird');
      
      RETURN QUERY SELECT 'early_bird'::text, true;
    END IF;
  END IF;

  -- Night Owl
  IF v_evening_sessions >= 20 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'night_owl') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'night_owl');
      
      RETURN QUERY SELECT 'night_owl'::text, true;
    END IF;
  END IF;

  -- Consistent Learner
  IF v_study_streak >= 14 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'consistent_learner') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'consistent_learner');
      
      RETURN QUERY SELECT 'consistent_learner'::text, true;
    END IF;
  END IF;

  -- Study Streak 30
  IF v_study_streak >= 30 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'study_streak_30') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'study_streak_30');
      
      RETURN QUERY SELECT 'study_streak_30'::text, true;
    END IF;
  END IF;

  -- Study Streak 100
  IF v_study_streak >= 100 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'study_streak_100') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'study_streak_100');
      
      RETURN QUERY SELECT 'study_streak_100'::text, true;
    END IF;
  END IF;

  -- Word Master 50
  IF v_mastered_words >= 50 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'word_master_50') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'word_master_50');
      
      RETURN QUERY SELECT 'word_master_50'::text, true;
    END IF;
  END IF;

  -- Word Master 100
  IF v_mastered_words >= 100 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'word_master_100') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'word_master_100');
      
      RETURN QUERY SELECT 'word_master_100'::text, true;
    END IF;
  END IF;

  -- Word Master 500
  IF v_mastered_words >= 500 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'word_master_500') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'word_master_500');
      
      RETURN QUERY SELECT 'word_master_500'::text, true;
    END IF;
  END IF;

  -- Word Master 1000
  IF v_mastered_words >= 1000 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'word_master_1000') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'word_master_1000');
      
      RETURN QUERY SELECT 'word_master_1000'::text, true;
    END IF;
  END IF;

  -- Time Investor (300 min)
  IF v_total_study_time >= 300 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'dedicated_learner_300') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'dedicated_learner_300');
      
      RETURN QUERY SELECT 'dedicated_learner_300'::text, true;
    END IF;
  END IF;

  -- Study Enthusiast (1000 min)
  IF v_total_study_time >= 1000 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'dedicated_learner_1000') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'dedicated_learner_1000');
      
      RETURN QUERY SELECT 'dedicated_learner_1000'::text, true;
    END IF;
  END IF;

  -- Marathon Learner
  IF v_max_session_time >= 60 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'marathon_learner') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'marathon_learner');
      
      RETURN QUERY SELECT 'marathon_learner'::text, true;
    END IF;
  END IF;

  -- Accuracy Champion
  IF v_overall_accuracy >= 90 AND v_total_reviews >= 100 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'accuracy_champion') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'accuracy_champion');
      
      RETURN QUERY SELECT 'accuracy_champion'::text, true;
    END IF;
  END IF;

  -- Consistent Accuracy
  IF v_consecutive_accurate_sessions >= 20 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'consistent_accuracy') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'consistent_accuracy');
      
      RETURN QUERY SELECT 'consistent_accuracy'::text, true;
    END IF;
  END IF;

  -- Organizer
  IF v_total_folders >= 5 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'organizer') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'organizer');
      
      RETURN QUERY SELECT 'organizer'::text, true;
    END IF;
  END IF;

  -- Folder Master
  IF v_populated_folders >= 15 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'folder_master') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'folder_master');
      
      RETURN QUERY SELECT 'folder_master'::text, true;
    END IF;
  END IF;

  -- Category Expert
  IF v_words_in_folders >= 500 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'category_expert') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'category_expert');
      
      RETURN QUERY SELECT 'category_expert'::text, true;
    END IF;
  END IF;

  -- Session Warrior
  IF v_total_sessions >= 50 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'session_warrior') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'session_warrior');
      
      RETURN QUERY SELECT 'session_warrior'::text, true;
    END IF;
  END IF;

  -- Focused Learner
  IF v_focused_sessions >= 10 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'focused_learner') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'focused_learner');
      
      RETURN QUERY SELECT 'focused_learner'::text, true;
    END IF;
  END IF;

  -- Review Champion
  IF v_total_reviews >= 500 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'review_champion') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'review_champion');
      
      RETURN QUERY SELECT 'review_champion'::text, true;
    END IF;
  END IF;

  -- Review Master
  IF v_total_reviews >= 1000 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'review_master') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'review_master');
      
      RETURN QUERY SELECT 'review_master'::text, true;
    END IF;
  END IF;

  -- Review Legend
  IF v_total_reviews >= 5000 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'review_legend') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'review_legend');
      
      RETURN QUERY SELECT 'review_legend'::text, true;
    END IF;
  END IF;

  -- Comeback Kid
  IF v_days_since_last_session >= 7 AND v_total_sessions > 0 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'comeback_kid') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'comeback_kid');
      
      RETURN QUERY SELECT 'comeback_kid'::text, true;
    END IF;
  END IF;

  -- Speed Learner
  IF v_single_day_mastered >= 10 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'speed_learner') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'speed_learner');
      
      RETURN QUERY SELECT 'speed_learner'::text, true;
    END IF;
  END IF;

  -- Completionist
  IF v_achievement_count >= 20 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'completionist') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'completionist');
      
      RETURN QUERY SELECT 'completionist'::text, true;
    END IF;
  END IF;

  -- Perfectionist (100% accuracy in a session)
  IF EXISTS (
    SELECT 1 FROM study_sessions s
    WHERE s.user_id = p_user_id 
      AND s.completed_at IS NOT NULL
      AND s.words_studied > 0
      AND s.correct_answers = s.words_studied
  ) THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'perfectionist') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (p_user_id, 'perfectionist');
      
      RETURN QUERY SELECT 'perfectionist'::text, true;
    END IF;
  END IF;

  -- Daily Reviewer
  IF v_study_streak >= 30 AND v_total_sessions >= 30 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'daily_reviewer') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
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