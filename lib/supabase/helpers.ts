import type { Database } from './database.types'
import type { User, Team, Lead, OutreachDraft, Asset } from '../types'

// Convert database team to app team
export function dbTeamToTeam(dbTeam: Database['public']['Tables']['teams']['Row']): Team {
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    sport: dbTeam.sport,
    location: dbTeam.location,
    league: dbTeam.league,
    seasonStart: dbTeam.season_start,
    seasonEnd: dbTeam.season_end,
    audience: dbTeam.audience,
    sponsorshipNeeds: dbTeam.sponsorship_needs,
    targetAmount: dbTeam.target_amount,
    existingSponsors: dbTeam.existing_sponsors,
    primaryColor: dbTeam.primary_color,
    secondaryColor: dbTeam.secondary_color,
    logoUrl: dbTeam.logo_url,
  }
}

// Convert app team to database team
export function teamToDbTeam(team: Team, userId: string): Database['public']['Tables']['teams']['Insert'] {
  return {
    user_id: userId,
    name: team.name,
    sport: team.sport,
    location: team.location,
    league: team.league,
    season_start: team.seasonStart,
    season_end: team.seasonEnd,
    audience: team.audience,
    sponsorship_needs: team.sponsorshipNeeds,
    target_amount: team.targetAmount,
    existing_sponsors: team.existingSponsors,
    primary_color: team.primaryColor,
    secondary_color: team.secondaryColor,
    logo_url: team.logoUrl,
  }
}

// Convert database lead to app lead
export function dbLeadToLead(dbLead: Database['public']['Tables']['leads']['Row']): Lead {
  return {
    id: dbLead.id,
    companyName: dbLead.company_name,
    category: dbLead.category,
    contact: dbLead.contact,
    email: dbLead.email,
    location: dbLead.location,
    fitReason: dbLead.fit_reason,
    status: dbLead.status,
    notes: dbLead.notes,
    createdAt: dbLead.created_at,
  }
}

// Convert app lead to database lead
export function leadToDbLead(lead: Omit<Lead, 'id' | 'createdAt'>, teamId: string): Database['public']['Tables']['leads']['Insert'] {
  return {
    team_id: teamId,
    company_name: lead.companyName,
    category: lead.category,
    contact: lead.contact,
    email: lead.email,
    location: lead.location,
    fit_reason: lead.fitReason,
    status: lead.status,
    notes: lead.notes,
  }
}

// Convert database draft to app draft
export function dbDraftToDraft(dbDraft: Database['public']['Tables']['outreach_drafts']['Row']): OutreachDraft {
  return {
    id: dbDraft.id,
    leadId: dbDraft.lead_id,
    emailSubject: dbDraft.email_subject,
    emailBody: dbDraft.email_body,
    proposalText: dbDraft.proposal_text,
    status: dbDraft.status,
    createdAt: dbDraft.created_at,
  }
}

// Convert app draft to database draft
export function draftToDbDraft(draft: Omit<OutreachDraft, 'id' | 'createdAt'>, teamId: string): Database['public']['Tables']['outreach_drafts']['Insert'] {
  return {
    team_id: teamId,
    lead_id: draft.leadId,
    email_subject: draft.emailSubject,
    email_body: draft.emailBody,
    proposal_text: draft.proposalText,
    status: draft.status,
  }
}

// Convert database asset to app asset
export function dbAssetToAsset(dbAsset: Database['public']['Tables']['assets']['Row']): Asset {
  return {
    id: dbAsset.id,
    teamId: dbAsset.team_id,
    type: dbAsset.type,
    name: dbAsset.name,
    url: dbAsset.url,
    createdAt: dbAsset.created_at,
  }
}

// Convert app asset to database asset
export function assetToDbAsset(asset: Omit<Asset, 'id' | 'createdAt'>, teamId: string): Database['public']['Tables']['assets']['Insert'] {
  return {
    team_id: teamId,
    type: asset.type,
    name: asset.name,
    url: asset.url,
  }
}
