"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react"
import type { Team } from "@/lib/types"

const TOTAL_STEPS = 4

const sports = ["Soccer", "Basketball", "Baseball", "Football", "Hockey", "Volleyball", "Lacrosse", "Other"]
const leagues = ["Recreational", "Club", "Travel", "High School", "College"]

export function OnboardingForm() {
  const { setTeam, setOnboarded } = useApp()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: "",
    sport: "",
    location: "",
    league: "",
    seasonStart: "",
    seasonEnd: "",
    audience: "",
    sponsorshipNeeds: "",
    targetAmount: "",
    existingSponsors: "",
    primaryColor: "#0d9488",
    secondaryColor: "#f59e0b",
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const MAX_LOGO_BYTES = 2 * 1024 * 1024 // 2MB
  const ACCEPTED_LOGO_TYPES = "image/png,image/svg+xml"

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function next() {
    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  function back() {
    if (step > 1) setStep(step - 1)
  }

  function handleLogoClick() {
    logoInputRef.current?.click()
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.match(/^image\/(png|svg\+xml)$/)) {
      toast.error("Please select a PNG or SVG image")
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Logo must be 2MB or smaller")
      return
    }
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl)
    setLogoFile(file)
    setLogoPreviewUrl(URL.createObjectURL(file))
    e.target.value = ""
  }

  async function handleSubmit() {
    try {
      const team: Team = {
        id: "",
        name: form.name || "My Team",
        sport: form.sport || "Soccer",
        location: form.location || "00000",
        league: form.league || "Club",
        seasonStart: form.seasonStart || "2026-03-01",
        seasonEnd: form.seasonEnd || "2026-08-15",
        audience: form.audience || "",
        sponsorshipNeeds: form.sponsorshipNeeds || "",
        targetAmount: parseInt(form.targetAmount) || 10000,
        existingSponsors: form.existingSponsors || "",
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        logoUrl: "",
      }
      const savedTeam = await setTeam(team)
      if (logoFile && savedTeam) {
        const formData = new FormData()
        formData.append("file", logoFile)
        formData.append("type", "logo")
        formData.append("name", "Team logo")
        const res = await fetch("/api/assets", { method: "POST", body: formData })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to upload logo")
        }
        const { asset } = await res.json()
        await setTeam({ ...savedTeam, logoUrl: asset.url })
      }
      setOnboarded(true)
      toast.success("Team setup complete! Let's find some sponsors.")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Failed to save team. Please try again.")
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Basics</CardTitle>
            <CardDescription>Tell us about your team so we can find the right sponsors.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="e.g. Riverside Thunder"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sport">Sport</Label>
              <Select value={form.sport} onValueChange={(v) => update("sport", v)}>
                <SelectTrigger id="sport">
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Zip Code</Label>
              <Input
                id="location"
                placeholder="e.g. 92501"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="league">League Level</Label>
              <Select value={form.league} onValueChange={(v) => update("league", v)}>
                <SelectTrigger id="league">
                  <SelectValue placeholder="Select league level" />
                </SelectTrigger>
                <SelectContent>
                  {leagues.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Season & Community</CardTitle>
            <CardDescription>Help us understand your audience and timeline.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="seasonStart">Season Start</Label>
                <Input
                  id="seasonStart"
                  type="date"
                  value={form.seasonStart}
                  onChange={(e) => update("seasonStart", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="seasonEnd">Season End</Label>
                <Input
                  id="seasonEnd"
                  type="date"
                  value={form.seasonEnd}
                  onChange={(e) => update("seasonEnd", e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="audience">Audience / Community</Label>
              <Textarea
                id="audience"
                placeholder="Describe your team's community, families, and reach..."
                value={form.audience}
                onChange={(e) => update("audience", e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="needs">Sponsorship Needs</Label>
              <Textarea
                id="needs"
                placeholder="What do you need sponsorship for? (jerseys, tournaments, equipment...)"
                value={form.sponsorshipNeeds}
                onChange={(e) => update("sponsorshipNeeds", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Fundraising Goals</CardTitle>
            <CardDescription>Set your target and let us know about existing sponsors.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="target">Target Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="target"
                  type="number"
                  placeholder="15000"
                  className="pl-7"
                  value={form.targetAmount}
                  onChange={(e) => update("targetAmount", e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="existing">Existing Sponsors</Label>
              <Textarea
                id="existing"
                placeholder="List any current sponsors, separated by commas..."
                value={form.existingSponsors}
                onChange={(e) => update("existingSponsors", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Branding</CardTitle>
            <CardDescription>Your colors will appear on proposals and jersey mockups.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="primary">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primary"
                    value={form.primaryColor}
                    onChange={(e) => update("primaryColor", e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => update("primaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="secondary">Secondary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="secondary"
                    value={form.secondaryColor}
                    onChange={(e) => update("secondaryColor", e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                  />
                  <Input
                    value={form.secondaryColor}
                    onChange={(e) => update("secondaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Logo Upload</Label>
              <input
                ref={logoInputRef}
                type="file"
                accept={ACCEPTED_LOGO_TYPES}
                onChange={handleLogoChange}
                className="sr-only"
                aria-label="Upload team logo"
              />
              <button
                type="button"
                onClick={handleLogoClick}
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {logoPreviewUrl ? (
                  <>
                    <img
                      src={logoPreviewUrl}
                      alt="Logo preview"
                      className="max-h-20 max-w-[120px] object-contain"
                    />
                    <span className="text-xs">Click to replace</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    <span>Click to upload your team logo (optional)</span>
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground">PNG or SVG, max 2MB</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={back}
          disabled={step === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step < TOTAL_STEPS ? (
          <Button onClick={next} className="gap-2">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="gap-2">
            <Check className="h-4 w-4" />
            Complete Setup
          </Button>
        )}
      </div>
    </div>
  )
}
