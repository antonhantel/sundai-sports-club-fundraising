"use client"

import { useState } from "react"
import { useApp } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Search } from "lucide-react"
import type { Lead } from "@/lib/types"

const AUDIENCES = [
  "Families with kids",
  "College students",
  "Young professionals",
  "General community",
  "Senior citizens",
]

const LEAD_COUNTS = ["5", "10", "15", "20"]

interface FindLeadsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FindLeadsDialog({ open, onOpenChange }: FindLeadsDialogProps) {
  const { addLeads } = useApp()
  const [zipCode, setZipCode] = useState("")
  const [audience, setAudience] = useState("")
  const [limit, setLimit] = useState("10")
  const [isSearching, setIsSearching] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!/^\d{5}$/.test(zipCode)) {
      toast.error("Please enter a valid 5-digit zip code")
      return
    }

    if (!audience) {
      toast.error("Please select an audience type")
      return
    }

    try {
      setIsSearching(true)
      const res = await fetch("/api/leads/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode, audience, limit: parseInt(limit) }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to find leads")
      }

      const data = await res.json()
      const leads: Lead[] = data.leads

      if (leads.length === 0) {
        toast.info("No businesses found for that search. Try a different zip code or audience.")
        return
      }

      await addLeads(leads)
      toast.success(`Found ${leads.length} new potential sponsors`)
      onOpenChange(false)
      setZipCode("")
      setAudience("")
      setLimit("10")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to find leads")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find New Leads</DialogTitle>
          <DialogDescription>
            Search for local businesses that could be potential sponsors.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              placeholder="e.g. 92501"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={5}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="audience">Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger id="audience">
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="limit">Number of leads</Label>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger id="limit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_COUNTS.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSearching} className="gap-2">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
