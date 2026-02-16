-- Add attachments column to outreach_drafts table
-- This column stores an array of asset IDs that should be attached to the draft

ALTER TABLE outreach_drafts
ADD COLUMN IF NOT EXISTS attachments TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN outreach_drafts.attachments IS 'Array of asset IDs to attach to the draft email';
