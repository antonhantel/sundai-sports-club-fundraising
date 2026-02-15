-- Add Apify-specific columns to leads table (rating, reviews, website, phone)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS review_count INTEGER;
