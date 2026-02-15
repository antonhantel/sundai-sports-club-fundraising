-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  location TEXT NOT NULL,
  league TEXT NOT NULL,
  season_start DATE NOT NULL,
  season_end DATE NOT NULL,
  audience TEXT NOT NULL,
  sponsorship_needs TEXT NOT NULL,
  target_amount INTEGER NOT NULL,
  existing_sponsors TEXT NOT NULL DEFAULT '',
  primary_color TEXT NOT NULL DEFAULT '#0d9488',
  secondary_color TEXT NOT NULL DEFAULT '#f59e0b',
  logo_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  fit_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approved', 'drafted', 'sent')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outreach drafts table
CREATE TABLE IF NOT EXISTS outreach_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  proposal_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'sent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('proposal', 'jersey-mockup', 'logo', 'media')),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_team_id ON leads(team_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_outreach_drafts_team_id ON outreach_drafts(team_id);
CREATE INDEX IF NOT EXISTS idx_outreach_drafts_lead_id ON outreach_drafts(lead_id);
CREATE INDEX IF NOT EXISTS idx_assets_team_id ON assets(team_id);

-- Note: RLS policies are set up in a separate migration file
-- Run supabase-rls-policies.sql after this migration

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
-- Drop existing triggers if they exist (idempotent)
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_outreach_drafts_updated_at ON outreach_drafts;

-- Create triggers
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_drafts_updated_at BEFORE UPDATE ON outreach_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
