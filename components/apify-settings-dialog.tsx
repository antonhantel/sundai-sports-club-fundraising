"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings2, Loader2 } from "lucide-react"
import type { ApifyRunInput } from "@/lib/apify-types"

interface ApifySettingsDialogProps {
  onFetch: (settings: ApifyRunInput) => Promise<void>
  isFetching: boolean
  trigger?: React.ReactNode
}

const defaultSettings: ApifyRunInput = {
  searchStringsArray: ["restaurant"],
  locationQuery: "New York, USA",
  maxCrawledPlacesPerSearch: 50,
  language: "en",
  website: "allPlaces",
  skipClosedPlaces: false,
}

export function ApifySettingsDialog({
  onFetch,
  isFetching,
  trigger,
}: ApifySettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchStrings, setSearchStrings] = useState(defaultSettings.searchStringsArray.join(", "))
  const [locationQuery, setLocationQuery] = useState(defaultSettings.locationQuery)
  const [maxPlaces, setMaxPlaces] = useState(defaultSettings.maxCrawledPlacesPerSearch ?? 50)

  const handleFetch = async () => {
    const searchStringsArray = searchStrings
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (searchStringsArray.length === 0) searchStringsArray.push("restaurant")

    const settings: ApifyRunInput = {
      ...defaultSettings,
      searchStringsArray,
      locationQuery: locationQuery.trim() || defaultSettings.locationQuery,
      maxCrawledPlacesPerSearch: Math.min(Math.max(1, maxPlaces), 200),
    }

    await onFetch(settings)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Apify Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apify Lead Discovery Settings</DialogTitle>
          <DialogDescription>
            Configure search parameters for the Google Maps scraper. New leads will be pulled based on these settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="searchStrings">Search terms (comma-separated)</Label>
            <Input
              id="searchStrings"
              placeholder="restaurant, cafe, gym"
              value={searchStrings}
              onChange={(e) => setSearchStrings(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="locationQuery">Location</Label>
            <Input
              id="locationQuery"
              placeholder="New York, USA"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxPlaces">Max places per search (1–200)</Label>
            <Input
              id="maxPlaces"
              type="number"
              min={1}
              max={200}
              value={maxPlaces}
              onChange={(e) => setMaxPlaces(parseInt(e.target.value, 10) || 50)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isFetching}>
            Cancel
          </Button>
          <Button onClick={handleFetch} disabled={isFetching} className="gap-2">
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Pull Leads
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
