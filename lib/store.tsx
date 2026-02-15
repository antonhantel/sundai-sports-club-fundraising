"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User, Team, Lead, OutreachDraft, Asset, LeadStatus } from "./types"
import { createClient } from "./supabase/client"
import {
  dbTeamToTeam,
  dbLeadToLead,
  dbDraftToDraft,
  dbAssetToAsset,
  teamToDbTeam,
  leadToDbLead,
  draftToDbDraft,
  assetToDbAsset,
} from "./supabase/helpers"

interface AppState {
  user: User | null
  team: Team | null
  leads: Lead[]
  drafts: OutreachDraft[]
  assets: Asset[]
  isOnboarded: boolean
}

interface AppContextValue extends AppState {
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  setTeam: (team: Team) => Promise<void>
  setOnboarded: (val: boolean) => void
  updateLeadStatus: (leadId: string, status: LeadStatus) => Promise<void>
  updateLeadNotes: (leadId: string, notes: string) => Promise<void>
  bulkUpdateLeadStatus: (leadIds: string[], status: LeadStatus) => Promise<void>
  addLeads: (newLeads: Lead[]) => Promise<void>
  addDraft: (draft: OutreachDraft) => Promise<void>
  updateDraftStatus: (draftId: string, status: "draft" | "reviewed" | "sent") => Promise<void>
  addAsset: (asset: Asset) => Promise<void>
  deleteAsset: (assetId: string) => Promise<void>
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    team: null,
    leads: [],
    drafts: [],
    assets: [],
    isOnboarded: false,
  })
  const [hydrated, setHydrated] = useState(false)
  const supabase = createClient()

  // Load user and data from Supabase
  const loadData = useCallback(async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split("@")[0],
          avatarUrl: "",
        }
        setState((prev) => ({ ...prev, user }))

        // Load team
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (teamData && !teamError) {
          const team = dbTeamToTeam(teamData)
          setState((prev) => ({ ...prev, team, isOnboarded: true }))

          // Load leads
          const { data: leadsData } = await supabase
            .from("leads")
            .select("*")
            .eq("team_id", team.id)
            .order("created_at", { ascending: false })

          if (leadsData) {
            setState((prev) => ({
              ...prev,
              leads: leadsData.map(dbLeadToLead),
            }))
          }

          // Load drafts
          const { data: draftsData } = await supabase
            .from("outreach_drafts")
            .select("*")
            .eq("team_id", team.id)
            .order("created_at", { ascending: false })

          if (draftsData) {
            setState((prev) => ({
              ...prev,
              drafts: draftsData.map(dbDraftToDraft),
            }))
          }

          // Load assets
          const { data: assetsData } = await supabase
            .from("assets")
            .select("*")
            .eq("team_id", team.id)
            .order("created_at", { ascending: false })

          if (assetsData) {
            setState((prev) => ({
              ...prev,
              assets: assetsData.map(dbAssetToAsset),
            }))
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setHydrated(true)
    }
  }, [supabase])

  useEffect(() => {
    loadData()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadData()
      } else {
        setState({
          user: null,
          team: null,
          leads: [],
          drafts: [],
          assets: [],
          isOnboarded: false,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadData, supabase])

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({ ...prev, user }))
    if (user) {
      loadData()
    }
  }, [loadData])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setState({
      user: null,
      team: null,
      leads: [],
      drafts: [],
      assets: [],
      isOnboarded: false,
    })
  }, [supabase])

  const refreshData = useCallback(async () => {
    await loadData()
  }, [loadData])

  const setTeam = useCallback(async (team: Team) => {
    if (!state.user) return

    try {
      const dbTeam = teamToDbTeam(team, state.user.id)
      const { data, error } = await supabase
        .from("teams")
        .upsert({ ...dbTeam, id: team.id || undefined }, { onConflict: "id" })
        .select()
        .single()

      if (error) throw error
      if (data) {
        const updatedTeam = dbTeamToTeam(data)
        setState((prev) => ({ ...prev, team: updatedTeam, isOnboarded: true }))
      }
    } catch (error) {
      console.error("Error saving team:", error)
      throw error
    }
  }, [state.user, supabase])

  const setOnboarded = useCallback((val: boolean) => {
    setState((prev) => ({ ...prev, isOnboarded: val }))
  }, [])

  const updateLeadStatus = useCallback(async (leadId: string, status: LeadStatus) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", leadId)

      if (error) throw error
      setState((prev) => ({
        ...prev,
        leads: prev.leads.map((l) => (l.id === leadId ? { ...l, status } : l)),
      }))
    } catch (error) {
      console.error("Error updating lead status:", error)
      throw error
    }
  }, [supabase])

  const updateLeadNotes = useCallback(async (leadId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ notes })
        .eq("id", leadId)

      if (error) throw error
      setState((prev) => ({
        ...prev,
        leads: prev.leads.map((l) => (l.id === leadId ? { ...l, notes } : l)),
      }))
    } catch (error) {
      console.error("Error updating lead notes:", error)
      throw error
    }
  }, [supabase])

  const bulkUpdateLeadStatus = useCallback(async (leadIds: string[], status: LeadStatus) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .in("id", leadIds)

      if (error) throw error
      setState((prev) => ({
        ...prev,
        leads: prev.leads.map((l) =>
          leadIds.includes(l.id) ? { ...l, status } : l
        ),
      }))
    } catch (error) {
      console.error("Error bulk updating leads:", error)
      throw error
    }
  }, [supabase])

  const addLeads = useCallback(async (newLeads: Lead[]) => {
    if (!state.team) return

    try {
      const dbLeads = newLeads.map((lead) => leadToDbLead(lead, state.team!.id))
      const { data, error } = await supabase
        .from("leads")
        .insert(dbLeads)
        .select()

      if (error) throw error
      if (data) {
        setState((prev) => ({
          ...prev,
          leads: [...prev.leads, ...data.map(dbLeadToLead)],
        }))
      }
    } catch (error) {
      console.error("Error adding leads:", error)
      throw error
    }
  }, [state.team, supabase])

  const addDraft = useCallback(async (draft: OutreachDraft) => {
    if (!state.team) return

    try {
      const dbDraft = draftToDbDraft(draft, state.team.id)
      const { data, error } = await supabase
        .from("outreach_drafts")
        .insert(dbDraft)
        .select()
        .single()

      if (error) throw error
      if (data) {
        setState((prev) => ({
          ...prev,
          drafts: [...prev.drafts, dbDraftToDraft(data)],
        }))
      }
    } catch (error) {
      console.error("Error adding draft:", error)
      throw error
    }
  }, [state.team, supabase])

  const updateDraftStatus = useCallback(async (draftId: string, status: "draft" | "reviewed" | "sent") => {
    try {
      const { error } = await supabase
        .from("outreach_drafts")
        .update({ status })
        .eq("id", draftId)

      if (error) throw error
      setState((prev) => ({
        ...prev,
        drafts: prev.drafts.map((d) => (d.id === draftId ? { ...d, status } : d)),
      }))
    } catch (error) {
      console.error("Error updating draft status:", error)
      throw error
    }
  }, [supabase])

  const addAsset = useCallback(async (asset: Asset) => {
    if (!state.team) return

    try {
      const dbAsset = assetToDbAsset(asset, state.team.id)
      const { data, error } = await supabase
        .from("assets")
        .insert(dbAsset)
        .select()
        .single()

      if (error) throw error
      if (data) {
        setState((prev) => ({
          ...prev,
          assets: [...prev.assets, dbAssetToAsset(data)],
        }))
      }
    } catch (error) {
      console.error("Error adding asset:", error)
      throw error
    }
  }, [state.team, supabase])

  const deleteAsset = useCallback(async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets?id=${assetId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete asset")
      }

      setState((prev) => ({
        ...prev,
        assets: prev.assets.filter((a) => a.id !== assetId),
      }))
    } catch (error) {
      console.error("Error deleting asset:", error)
      throw error
    }
  }, [])

  if (!hydrated) {
    return null
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        setUser,
        logout,
        setTeam,
        setOnboarded,
        updateLeadStatus,
        updateLeadNotes,
        bulkUpdateLeadStatus,
        addLeads,
        addDraft,
        updateDraftStatus,
        addAsset,
        deleteAsset,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
