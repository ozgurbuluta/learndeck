-- Debug script to test achievements
-- Replace 'YOUR_USER_ID' with the actual user ID from your session

-- First, let's see what users exist
SELECT id, email FROM auth.users LIMIT 5;

-- Check if there are any words for the user
-- You'll need to replace the user_id with your actual user ID
SELECT COUNT(*) as word_count FROM words WHERE user_id = 'YOUR_USER_ID';

-- Check existing achievements
SELECT * FROM achievements WHERE user_id = 'YOUR_USER_ID';

-- Test the RPC function directly
-- Replace with your actual user ID
SELECT * FROM check_and_grant_achievements('YOUR_USER_ID');

-- Check the user's profile stats
SELECT study_streak, total_study_time FROM profiles WHERE id = 'YOUR_USER_ID';