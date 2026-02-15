"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User, Team, Lead, OutreachDraft, Asset, LeadStatus } from "./types"
import { mockUser, mockTeam, mockLeads, mockDrafts, mockAssets } from "./mock-data"

interface AppState {
  user: User | null
  team: Team | null
  leads: Lead[]
  drafts: OutreachDraft[]
  assets: Asset[]
  isOnboarded: boolean
}

interface AppContextValue extends AppState {
  login: () => void
  logout: () => void
  setTeam: (team: Team) => void
  setOnboarded: (val: boolean) => void
  updateLeadStatus: (leadId: string, status: LeadStatus) => void
  updateLeadNotes: (leadId: string, notes: string) => void
  bulkUpdateLeadStatus: (leadIds: string[], status: LeadStatus) => void
  addLeads: (newLeads: Lead[]) => void
  addDraft: (draft: OutreachDraft) => void
  updateDraftStatus: (draftId: string, status: "draft" | "reviewed" | "sent") => void
  addAsset: (asset: Asset) => void
}

const AppContext = createContext<AppContextValue | null>(null)

const STORAGE_KEY = "teamfund-state"

function loadState(): Partial<AppState> | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore parse errors
  }
  return null
}

function saveState(state: AppState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

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

  useEffect(() => {
    const stored = loadState()
    if (stored && stored.user) {
      setState({
        user: stored.user ?? null,
        team: stored.team ?? null,
        leads: stored.leads ?? mockLeads,
        drafts: stored.drafts ?? mockDrafts,
        assets: stored.assets ?? mockAssets,
        isOnboarded: stored.isOnboarded ?? false,
      })
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      saveState(state)
    }
  }, [state, hydrated])

  const login = useCallback(() => {
    setState((prev) => ({
      ...prev,
      user: mockUser,
      leads: prev.leads.length > 0 ? prev.leads : mockLeads,
      drafts: prev.drafts.length > 0 ? prev.drafts : mockDrafts,
      assets: prev.assets.length > 0 ? prev.assets : mockAssets,
    }))
  }, [])

  const logout = useCallback(() => {
    setState({
      user: null,
      team: null,
      leads: [],
      drafts: [],
      assets: [],
      isOnboarded: false,
    })
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const setTeam = useCallback((team: Team) => {
    setState((prev) => ({ ...prev, team }))
  }, [])

  const setOnboarded = useCallback((val: boolean) => {
    setState((prev) => ({ ...prev, isOnboarded: val }))
  }, [])

  const updateLeadStatus = useCallback((leadId: string, status: LeadStatus) => {
    setState((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === leadId ? { ...l, status } : l)),
    }))
  }, [])

  const updateLeadNotes = useCallback((leadId: string, notes: string) => {
    setState((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === leadId ? { ...l, notes } : l)),
    }))
  }, [])

  const bulkUpdateLeadStatus = useCallback((leadIds: string[], status: LeadStatus) => {
    setState((prev) => ({
      ...prev,
      leads: prev.leads.map((l) =>
        leadIds.includes(l.id) ? { ...l, status } : l
      ),
    }))
  }, [])

  const addLeads = useCallback((newLeads: Lead[]) => {
    setState((prev) => ({
      ...prev,
      leads: [...prev.leads, ...newLeads],
    }))
  }, [])

  const addDraft = useCallback((draft: OutreachDraft) => {
    setState((prev) => ({
      ...prev,
      drafts: [...prev.drafts, draft],
    }))
  }, [])

  const updateDraftStatus = useCallback((draftId: string, status: "draft" | "reviewed" | "sent") => {
    setState((prev) => ({
      ...prev,
      drafts: prev.drafts.map((d) => (d.id === draftId ? { ...d, status } : d)),
    }))
  }, [])

  const addAsset = useCallback((asset: Asset) => {
    setState((prev) => ({
      ...prev,
      assets: [...prev.assets, asset],
    }))
  }, [])

  if (!hydrated) {
    return null
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
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
