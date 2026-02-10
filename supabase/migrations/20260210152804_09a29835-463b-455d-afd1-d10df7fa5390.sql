
-- Create private bucket for music files
INSERT INTO storage.buckets (id, name, public) VALUES ('music-files', 'music-files', false);

-- Add new columns to music_tasks
ALTER TABLE public.music_tasks
ADD COLUMN download_url text,
ADD COLUMN download_expires_at timestamptz,
ADD COLUMN access_code text;

-- Add unique constraint on access_code
ALTER TABLE public.music_tasks ADD CONSTRAINT music_tasks_access_code_unique UNIQUE (access_code);
