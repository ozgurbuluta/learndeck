/*
  Remove full_name column from profiles table and update handle_new_user function
  to only use username.

  1. Changes:
    - Drop full_name column from profiles table
    - Update handle_new_user function to only set username
*/

-- First, update the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Then, remove the full_name column
ALTER TABLE profiles DROP COLUMN IF EXISTS full_name; 