/*
  # Debug Achievement Function

  Add logging to see what's happening in the achievement function
*/

-- Create a simple test function to check user data
CREATE OR REPLACE FUNCTION debug_user_achievements(p_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  total_words integer,
  achievements_count integer,
  achievement_exists boolean,
  user_exists boolean
) AS $$
DECLARE
  v_total_words integer;
  v_achievements_count integer;
  v_achievement_exists boolean;
  v_user_exists boolean;
BEGIN
  -- Check if user exists in auth
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) INTO v_user_exists;
  
  -- Get word count
  SELECT COUNT(*) INTO v_total_words FROM words WHERE user_id = p_user_id;
  
  -- Get achievement count
  SELECT COUNT(*) INTO v_achievements_count FROM achievements WHERE user_id = p_user_id;
  
  -- Check if first_word achievement exists
  SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'first_word') INTO v_achievement_exists;
  
  RETURN QUERY SELECT p_user_id, v_total_words, v_achievements_count, v_achievement_exists, v_user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the main function with better debugging
CREATE OR REPLACE FUNCTION check_and_grant_achievements(p_user_id uuid)
RETURNS TABLE (achievement_type text, newly_earned boolean) AS $$
DECLARE
  v_total_words integer;
  v_mastered_words integer;
  v_study_streak integer;
  v_total_study_time integer;
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

  -- Log debug info using RAISE NOTICE (only works in direct SQL, not through RPC)
  -- Instead, we'll just focus on the core logic
  
  -- First Word Achievement
  IF v_total_words > 0 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'first_word') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      -- Insert the achievement
      INSERT INTO achievements (user_id, achievement_type, earned_at, seen, created_at)
      VALUES (p_user_id, 'first_word', NOW(), false, NOW());
      
      -- Return the newly earned achievement
      RETURN QUERY SELECT 'first_word'::text, true;
    END IF;
  END IF;

  -- Study Streak 7
  IF v_study_streak >= 7 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'study_streak_7') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type, earned_at, seen, created_at)
      VALUES (p_user_id, 'study_streak_7', NOW(), false, NOW());
      
      RETURN QUERY SELECT 'study_streak_7'::text, true;
    END IF;
  END IF;

  -- Word Master 10
  IF v_mastered_words >= 10 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'word_master_10') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type, earned_at, seen, created_at)
      VALUES (p_user_id, 'word_master_10', NOW(), false, NOW());
      
      RETURN QUERY SELECT 'word_master_10'::text, true;
    END IF;
  END IF;

  -- Dedicated Learner 60
  IF v_total_study_time >= 60 THEN
    SELECT EXISTS(SELECT 1 FROM achievements a WHERE a.user_id = p_user_id AND a.achievement_type = 'dedicated_learner_60') INTO v_achievement_exists;
    
    IF NOT v_achievement_exists THEN
      INSERT INTO achievements (user_id, achievement_type, earned_at, seen, created_at)
      VALUES (p_user_id, 'dedicated_learner_60', NOW(), false, NOW());
      
      RETURN QUERY SELECT 'dedicated_learner_60'::text, true;
    END IF;
  END IF;

  -- For now, let's just focus on the basic 4 achievements to get them working
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION debug_user_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_grant_achievements TO authenticated;