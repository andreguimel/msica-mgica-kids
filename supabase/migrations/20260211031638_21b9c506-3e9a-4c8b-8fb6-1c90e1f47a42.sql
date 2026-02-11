
-- Add columns for Abacate Pay integration
ALTER TABLE public.music_tasks 
ADD COLUMN IF NOT EXISTS billing_id text,
ADD COLUMN IF NOT EXISTS payment_url text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
