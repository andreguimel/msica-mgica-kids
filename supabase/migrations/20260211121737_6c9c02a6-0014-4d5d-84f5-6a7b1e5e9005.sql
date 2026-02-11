-- Drop all existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert music tasks" ON public.music_tasks;
DROP POLICY IF EXISTS "Anyone can read music tasks" ON public.music_tasks;
DROP POLICY IF EXISTS "Anyone can update music tasks" ON public.music_tasks;

-- Create restrictive policies
-- All data access goes through edge functions using service_role_key (bypasses RLS)
-- These policies deny all access to the anon/authenticated roles directly
CREATE POLICY "Deny direct read access"
  ON public.music_tasks FOR SELECT
  USING (false);

CREATE POLICY "Deny direct insert access"
  ON public.music_tasks FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny direct update access"
  ON public.music_tasks FOR UPDATE
  USING (false);

CREATE POLICY "Deny direct delete access"
  ON public.music_tasks FOR DELETE
  USING (false);