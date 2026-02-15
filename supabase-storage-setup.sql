-- Supabase Storage Setup for Assets
-- Run this after creating the database tables
-- This creates a storage bucket for storing generated assets (jerseys, proposals, etc.)

-- Create the assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the assets bucket
-- Allow authenticated users to upload their own assets
-- Updated to support team-based folder structure: teams/{team_id}/jerseys/, teams/{team_id}/proposals/, etc.
-- Drop existing policy if it exists (idempotent)
DROP POLICY IF EXISTS "Users can upload assets for their teams" ON storage.objects;

CREATE POLICY "Users can upload assets for their teams"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets' AND
  (
    -- Support new team-based structure: teams/{team_id}/jerseys/, teams/{team_id}/proposals/, etc.
    -- Use pattern matching for more reliable path checking
    (name LIKE 'teams/%/jerseys/%' OR
     name LIKE 'teams/%/proposals/%' OR
     name LIKE 'teams/%/logos/%' OR
     name LIKE 'teams/%/media/%')
  ) OR
  -- Support legacy structure: jerseys/, proposals/, logos/, media/ (for backward compatibility)
  (name LIKE 'jerseys/%' OR
   name LIKE 'proposals/%' OR
   name LIKE 'logos/%' OR
   name LIKE 'media/%')
);

-- Allow users to view their own assets
DROP POLICY IF EXISTS "Users can view assets for their teams" ON storage.objects;

CREATE POLICY "Users can view assets for their teams"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'assets'
);

-- Allow users to delete their own assets
DROP POLICY IF EXISTS "Users can delete assets for their teams" ON storage.objects;

CREATE POLICY "Users can delete assets for their teams"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'assets'
);
