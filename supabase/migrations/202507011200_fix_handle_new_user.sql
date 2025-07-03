-- Re-adds unique-violation protection so sign-up never fails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1)
  );
  RETURN NEW;

EXCEPTION
  WHEN unique_violation THEN
    -- Profile (or username) already exists, let the sign-up succeed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
