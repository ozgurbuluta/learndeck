/*
  # Fix Authentication and Profile Issues

  1. Database Setup
    - Ensure proper trigger for automatic profile creation
    - Fix any RLS policy issues
    - Add missing constraints and indexes

  2. Security
    - Update RLS policies for profiles table
    - Ensure proper authentication flow

  3. Fixes
    - Handle edge cases in profile creation
    - Ensure trigger works correctly with auth.users
*/

-- Ensure the handle_new_user function exists and works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore the error
    RETURN new;
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow the trigger to insert profiles (service role)
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger for updating updated_at exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add any missing indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

-- Ensure words table RLS is properly configured
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- Verify words table policies exist (they should from your schema)
DO $$
BEGIN
  -- Check if policies exist, if not create them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'words' AND policyname = 'Users can read their own words'
  ) THEN
    CREATE POLICY "Users can read their own words"
      ON public.words
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'words' AND policyname = 'Users can insert their own words'
  ) THEN
    CREATE POLICY "Users can insert their own words"
      ON public.words
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'words' AND policyname = 'Users can update their own words'
  ) THEN
    CREATE POLICY "Users can update their own words"
      ON public.words
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'words' AND policyname = 'Users can delete their own words'
  ) THEN
    CREATE POLICY "Users can delete their own words"
      ON public.words
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;