"use client"

import { useState } from "react"
import Link from "next/link"
import { useApp } from "@/lib/store"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LeadStatusBadge } from "@/components/lead-status-badge"
import { toast } from "sonner"
import { Search, CheckCircle, Sparkles, Loader2, Plus, Trash2 } from "lucide-react"
import type { Lead } from "@/lib/types"

const newLeadPool: Omit<Lead, "id" | "createdAt">[] = [
  {
    companyName: "Pacific Coast Plumbing",
    category: "Home Services",
    contact: "Mike O'Brien",
    email: "mike@pacificcoastplumbing.com",
    location: "Riverside, CA",
    fitReason: "Well-known local service company. Home services businesses value community visibility.",
    status: "new",
    notes: "",
  },
  {
    companyName: "Sunrise Bakery & Cafe",
    category: "Restaurant",
    contact: "Diana Flores",
    email: "diana@sunrisebakerycafe.com",
    location: "Riverside, CA",
    fitReason: "Family cafe near the school district. Great for post-game treats and team celebrations.",
    status: "new",
    notes: "",
  },
  {
    companyName: "Riverside Martial Arts Academy",
    category: "Sports & Fitness",
    contact: "Sensei Rick Tanaka",
    email: "rick@riversidemartialarts.com",
    location: "Riverside, CA",
    fitReason: "Fellow youth sports organization. Cross-promotion opportunities for both programs.",
    status: "new",
    notes: "",
  },
]

export function LeadsTable() {
  const { leads, bulkUpdateLeadStatus, deleteLeads, addLeads } = useApp()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const filtered = leads.filter(
    (l) =>
      l.companyName.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()) ||
      l.contact.toLowerCase().includes(search.toLowerCase())
  )

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((l) => l.id)))
    }
  }

  async function handleApprove() {
    try {
      const ids = Array.from(selected)
      await bulkUpdateLeadStatus(ids, "approved")
      setSelected(new Set())
      toast.success(`${ids.length} lead${ids.length > 1 ? "s" : ""} approved`)
    } catch (error) {
      toast.error("Failed to approve leads")
    }
  }

  async function handleGenerate() {
    try {
      const ids = Array.from(selected)
      setIsGenerating(true)
      // TODO: Replace with OpenAI API call
      await new Promise((r) => setTimeout(r, 1500))
      await bulkUpdateLeadStatus(ids, "drafted")
      setSelected(new Set())
      toast.success(`Generated outreach for ${ids.length} lead${ids.length > 1 ? "s" : ""}`)
    } catch (error) {
      toast.error("Failed to generate outreach")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleDelete() {
    try {
      const ids = Array.from(selected)
      setIsDeleting(true)
      await deleteLeads(ids)
      setSelected(new Set())
      toast.success(`${ids.length} lead${ids.length > 1 ? "s" : ""} deleted`)
    } catch (error) {
      toast.error("Failed to delete leads")
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleFindNew() {
    try {
      setIsSearching(true)
      // TODO: Replace with Google Places API call
      await new Promise((r) => setTimeout(r, 1200))
      const newLeads: Lead[] = newLeadPool.map((l, i) => ({
        ...l,
        id: `lead-new-${Date.now()}-${i}`,
        createdAt: new Date().toISOString().split("T")[0],
      }))
      await addLeads(newLeads)
      toast.success(`Found ${newLeads.length} new potential sponsors`)
    } catch (error) {
      toast.error("Failed to add new leads")
    } finally {
      setIsSearching(false)
    }
  }

  const hasSelected = selected.size > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleFindNew} disabled={isSearching} variant="outline" className="gap-2">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Find New Leads
        </Button>
      </div>

      {hasSelected && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selected.size} selected
          </span>
          <Button size="sm" variant="outline" className="gap-1" onClick={handleApprove}>
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button size="sm" className="gap-1" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Generate Outreach
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow key={lead.id} className="group">
                <TableCell>
                  <Checkbox
                    checked={selected.has(lead.id)}
                    onCheckedChange={() => toggleSelect(lead.id)}
                    aria-label={`Select ${lead.companyName}`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="font-medium text-card-foreground underline-offset-2 hover:underline"
                  >
                    {lead.companyName}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground md:hidden">
                    {lead.category}
                  </p>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {lead.category}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {lead.contact}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {lead.location}
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
