/*
  # Add Folders Functionality

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, folder name)
      - `color` (text, optional color for the folder)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `word_folders` (junction table for many-to-many relationship)
      - `id` (uuid, primary key)
      - `word_id` (uuid, foreign key to words)
      - `folder_id` (uuid, foreign key to folders)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own folders and word-folder relationships

  3. Indexes
    - Add indexes for better query performance
*/

-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#fca311',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create word_folders junction table
CREATE TABLE IF NOT EXISTS public.word_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  folder_id uuid NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(word_id, folder_id)
);

-- Enable RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for folders
CREATE POLICY "Users can read their own folders"
  ON public.folders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders"
  ON public.folders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON public.folders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON public.folders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for word_folders
CREATE POLICY "Users can read their own word-folder relationships"
  ON public.word_folders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.words w 
      WHERE w.id = word_folders.word_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own word-folder relationships"
  ON public.word_folders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.words w 
      WHERE w.id = word_folders.word_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own word-folder relationships"
  ON public.word_folders
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.words w 
      WHERE w.id = word_folders.word_id AND w.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS folders_user_id_idx ON public.folders (user_id);
CREATE INDEX IF NOT EXISTS folders_name_idx ON public.folders (name);
CREATE INDEX IF NOT EXISTS word_folders_word_id_idx ON public.word_folders (word_id);
CREATE INDEX IF NOT EXISTS word_folders_folder_id_idx ON public.word_folders (folder_id);

-- Create trigger for updating updated_at on folders
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default folders for existing users (optional)
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM public.words LOOP
    INSERT INTO public.folders (user_id, name, color)
    VALUES 
      (user_record.user_id, 'General', '#fca311'),
      (user_record.user_id, 'Business', '#14213d'),
      (user_record.user_id, 'Travel', '#2a9d8f'),
      (user_record.user_id, 'Academic', '#e76f51')
    ON CONFLICT (user_id, name) DO NOTHING;
  END LOOP;
END $$;