export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          user_id: string
          name: string
          sport: string
          location: string
          league: string
          season_start: string
          season_end: string
          audience: string
          sponsorship_needs: string
          target_amount: number
          existing_sponsors: string
          primary_color: string
          secondary_color: string
          logo_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          sport: string
          location: string
          league: string
          season_start: string
          season_end: string
          audience: string
          sponsorship_needs: string
          target_amount: number
          existing_sponsors: string
          primary_color: string
          secondary_color: string
          logo_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          sport?: string
          location?: string
          league?: string
          season_start?: string
          season_end?: string
          audience?: string
          sponsorship_needs?: string
          target_amount?: number
          existing_sponsors?: string
          primary_color?: string
          secondary_color?: string
          logo_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          team_id: string
          company_name: string
          category: string
          contact: string
          email: string
          location: string
          fit_reason: string
          status: 'new' | 'approved' | 'drafted' | 'sent'
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          company_name: string
          category: string
          contact: string
          email: string
          location: string
          fit_reason: string
          status?: 'new' | 'approved' | 'drafted' | 'sent'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          company_name?: string
          category?: string
          contact?: string
          email?: string
          location?: string
          fit_reason?: string
          status?: 'new' | 'approved' | 'drafted' | 'sent'
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      outreach_drafts: {
        Row: {
          id: string
          team_id: string
          lead_id: string
          email_subject: string
          email_body: string
          proposal_text: string
          status: 'draft' | 'reviewed' | 'sent'
          attachments?: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          lead_id: string
          email_subject: string
          email_body: string
          proposal_text: string
          status?: 'draft' | 'reviewed' | 'sent'
          attachments?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          lead_id?: string
          email_subject?: string
          email_body?: string
          proposal_text?: string
          status?: 'draft' | 'reviewed' | 'sent'
          attachments?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          team_id: string
          type: 'proposal' | 'jersey-mockup' | 'logo'
          name: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          type: 'proposal' | 'jersey-mockup' | 'logo'
          name: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          type?: 'proposal' | 'jersey-mockup' | 'logo'
          name?: string
          url?: string
          created_at?: string
        }
      }
    }
  }
}
