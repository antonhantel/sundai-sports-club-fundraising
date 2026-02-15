-- Migration for EXISTING databases
-- Run this if you already have tables created and need to update the constraint

-- Drop the existing check constraint (if it exists)
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check;

-- Add the updated check constraint with 'media' included
ALTER TABLE assets ADD CONSTRAINT assets_type_check 
  CHECK (type IN ('proposal', 'jersey-mockup', 'logo', 'media'));

-- The triggers and function updates are already handled in the main migration
-- with DROP TRIGGER IF EXISTS, so those should be fine
