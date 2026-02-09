
-- Create music_tasks table for async Kie.ai music generation tracking
CREATE TABLE public.music_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id TEXT,
  child_name TEXT NOT NULL,
  theme TEXT NOT NULL,
  age_group TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  lyrics TEXT,
  audio_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.music_tasks ENABLE ROW LEVEL SECURITY;

-- Public read/insert since no auth is required for this app
CREATE POLICY "Anyone can insert music tasks"
  ON public.music_tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read music tasks"
  ON public.music_tasks FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update music tasks"
  ON public.music_tasks FOR UPDATE
  USING (true);
