/*
  # Drop and Recreate Achievement Function

  Need to drop the function first to change the return type signature
  and eliminate all ambiguous column references.
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS check_and_grant_achievements(uuid);

-- Recreate with new return type and no ambiguous references
CREATE OR REPLACE FUNCTION check_and_grant_achievements(p_user_id uuid)
RETURNS TABLE (earned_achievement_type text, is_newly_earned boolean) AS $$
DECLARE
  total_words integer;
  mastered_words integer;
  user_study_streak integer;
  user_total_study_time integer;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO total_words
  FROM words
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO mastered_words
  FROM words
  WHERE user_id = p_user_id AND difficulty = 'mastered';

  -- Use qualified column references to avoid ambiguity
  SELECT COALESCE(profiles.study_streak, 0), COALESCE(profiles.total_study_time, 0)
  INTO user_study_streak, user_total_study_time
  FROM profiles
  WHERE profiles.id = p_user_id;

  -- Check and grant First Word achievement
  IF total_words > 0 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'first_word')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    -- Check if this was newly inserted
    IF FOUND THEN
      RETURN QUERY SELECT 'first_word'::text, true;
    END IF;
  END IF;

  -- Check and grant Study Streak achievement
  IF user_study_streak >= 7 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'study_streak_7')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'study_streak_7'::text, true;
    END IF;
  END IF;

  -- Check and grant Word Master achievement
  IF mastered_words >= 10 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'word_master_10')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'word_master_10'::text, true;
    END IF;
  END IF;

  -- Check and grant Dedicated Learner achievement
  IF user_total_study_time >= 60 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (p_user_id, 'dedicated_learner_60')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'dedicated_learner_60'::text, true;
    END IF;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_and_grant_achievements TO authenticated;