-- Row Level Security (RLS) Policies Migration
-- This file sets up RLS policies for all tables
-- Run this after the main migration (supabase-migration.sql)
-- This migration is idempotent - safe to run multiple times

-- Enable Row Level Security on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own teams" ON teams;
DROP POLICY IF EXISTS "Users can insert their own teams" ON teams;
DROP POLICY IF EXISTS "Users can update their own teams" ON teams;
DROP POLICY IF EXISTS "Users can delete their own teams" ON teams;

DROP POLICY IF EXISTS "Users can view leads for their teams" ON leads;
DROP POLICY IF EXISTS "Users can insert leads for their teams" ON leads;
DROP POLICY IF EXISTS "Users can update leads for their teams" ON leads;
DROP POLICY IF EXISTS "Users can delete leads for their teams" ON leads;

DROP POLICY IF EXISTS "Users can view drafts for their teams" ON outreach_drafts;
DROP POLICY IF EXISTS "Users can insert drafts for their teams" ON outreach_drafts;
DROP POLICY IF EXISTS "Users can update drafts for their teams" ON outreach_drafts;
DROP POLICY IF EXISTS "Users can delete drafts for their teams" ON outreach_drafts;

DROP POLICY IF EXISTS "Users can view assets for their teams" ON assets;
DROP POLICY IF EXISTS "Users can insert assets for their teams" ON assets;
DROP POLICY IF EXISTS "Users can update assets for their teams" ON assets;
DROP POLICY IF EXISTS "Users can delete assets for their teams" ON assets;

-- RLS Policies for teams
-- Users can only access teams they own
CREATE POLICY "Users can view their own teams"
  ON teams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teams"
  ON teams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teams"
  ON teams FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for leads
-- Users can only access leads that belong to their teams
CREATE POLICY "Users can view leads for their teams"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = leads.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert leads for their teams"
  ON leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = leads.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads for their teams"
  ON leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = leads.team_id
      AND teams.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = leads.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete leads for their teams"
  ON leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = leads.team_id
      AND teams.user_id = auth.uid()
    )
  );

-- RLS Policies for outreach_drafts
-- Users can only access drafts that belong to their teams
CREATE POLICY "Users can view drafts for their teams"
  ON outreach_drafts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = outreach_drafts.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert drafts for their teams"
  ON outreach_drafts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = outreach_drafts.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update drafts for their teams"
  ON outreach_drafts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = outreach_drafts.team_id
      AND teams.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = outreach_drafts.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete drafts for their teams"
  ON outreach_drafts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = outreach_drafts.team_id
      AND teams.user_id = auth.uid()
    )
  );

-- RLS Policies for assets
-- Users can only access assets that belong to their teams
CREATE POLICY "Users can view assets for their teams"
  ON assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = assets.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert assets for their teams"
  ON assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = assets.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assets for their teams"
  ON assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = assets.team_id
      AND teams.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = assets.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete assets for their teams"
  ON assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = assets.team_id
      AND teams.user_id = auth.uid()
    )
  );
