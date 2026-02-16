export type LeadStatus = "new" | "approved" | "drafted" | "sent"

export type AssetType = "proposal" | "jersey-mockup" | "logo" | "media"

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string
}

export interface Team {
  id: string
  name: string
  sport: string
  location: string
  league: string
  seasonStart: string
  seasonEnd: string
  audience: string
  sponsorshipNeeds: string
  targetAmount: number
  existingSponsors: string
  primaryColor: string
  secondaryColor: string
  logoUrl: string
}

export interface Lead {
  id: string
  companyName: string
  category: string
  contact: string
  email: string
  location: string
  fitReason: string
  status: LeadStatus
  notes: string
  createdAt: string
}

export interface OutreachDraft {
  id: string
  leadId: string
  emailSubject: string
  emailBody: string
  proposalText: string
  status: "draft" | "reviewed" | "sent"
  attachments?: string[] // Array of asset IDs
  createdAt: string
}

export interface Asset {
  id: string
  teamId: string
  type: AssetType
  name: string
  url: string
  createdAt: string
}

export interface AgentLog {
  id: string
  action: string
  detail: string
  timestamp: string
}

export interface Donation {
  sessionId: string
  amount: number
  currency: string
  teamName: string
  customerEmail: string | null
  createdAt: string
}

export interface CheckoutSessionRequest {
  amount: number
  teamName: string
}
