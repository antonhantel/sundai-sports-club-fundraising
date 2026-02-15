-- Migration to add 'media' type to assets table
-- Run this after the initial migration if you need to add the 'media' asset type

-- Drop the existing check constraint
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check;

-- Add the updated check constraint with 'media' included
ALTER TABLE assets ADD CONSTRAINT assets_type_check 
  CHECK (type IN ('proposal', 'jersey-mockup', 'logo', 'media'));
