"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, CreditCard, Key, BarChart3, Edit2, Save, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

const sports = ["Soccer", "Basketball", "Baseball", "Football", "Hockey", "Volleyball", "Lacrosse", "Other"]
const leagues = ["Recreational", "Club", "Travel", "High School", "College"]

export default function SettingsPage() {
  const { user, team, leads, drafts, assets, logout, setTeam } = useApp()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: team?.name || "",
    sport: team?.sport || "",
    location: team?.location || "",
    league: team?.league || "",
    primaryColor: team?.primaryColor || "#0d9488",
    secondaryColor: team?.secondaryColor || "#f59e0b",
  })

  function handleLogout() {
    logout()
    router.push("/")
  }

  function handleEdit() {
    if (team) {
      setFormData({
        name: team.name || "",
        sport: team.sport || "",
        location: team.location || "",
        league: team.league || "",
        primaryColor: team.primaryColor || "#0d9488",
        secondaryColor: team.secondaryColor || "#f59e0b",
      })
    }
    setIsEditing(true)
  }

  function handleCancel() {
    setIsEditing(false)
    if (team) {
      setFormData({
        name: team.name || "",
        sport: team.sport || "",
        location: team.location || "",
        league: team.league || "",
        primaryColor: team.primaryColor || "#0d9488",
        secondaryColor: team.secondaryColor || "#f59e0b",
      })
    }
  }

  async function handleSave() {
    if (!team) return

    setIsSaving(true)
    try {
      const updatedTeam = {
        ...team,
        name: formData.name,
        sport: formData.sport,
        location: formData.location,
        league: formData.league,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
      }
      await setTeam(updatedTeam)
      setIsEditing(false)
      toast.success("Team profile updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update team profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your team profile, subscription, and account.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Profile</CardTitle>
                <CardDescription>Your team details as entered during onboarding.</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isEditing ? (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Riverside Thunder"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sport">Sport</Label>
                  <Select value={formData.sport} onValueChange={(v) => setFormData({ ...formData, sport: v })}>
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
                  <Label htmlFor="location">Location (Zip Code)</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. 92501"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="league">League Level</Label>
                  <Select value={formData.league} onValueChange={(v) => setFormData({ ...formData, league: v })}>
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
                <div className="flex flex-col gap-2">
                  <Label>Team Colors</Label>
                  <div className="flex gap-3">
                    <div className="flex flex-col gap-2 flex-1">
                      <Label htmlFor="primaryColor" className="text-xs text-muted-foreground">
                        Primary Color
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="h-10 w-20 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          placeholder="#0d9488"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <Label htmlFor="secondaryColor" className="text-xs text-muted-foreground">
                        Secondary Color
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="h-10 w-20 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          placeholder="#f59e0b"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={isSaving} className="flex-1 gap-2">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Team Name</Label>
                  <p className="text-sm font-medium text-card-foreground">{team?.name || "Not set"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Sport</Label>
                  <p className="text-sm font-medium text-card-foreground">{team?.sport || "Not set"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <p className="text-sm font-medium text-card-foreground">{team?.location || "Not set"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">League</Label>
                  <p className="text-sm font-medium text-card-foreground">{team?.league || "Not set"}</p>
                </div>
                {team?.primaryColor && (
                  <div className="flex items-center gap-3">
                    <Label className="text-xs text-muted-foreground">Colors</Label>
                    <div className="flex gap-2">
                      <div
                        className="h-6 w-6 rounded-full border border-border"
                        style={{ backgroundColor: team.primaryColor }}
                      />
                      <div
                        className="h-6 w-6 rounded-full border border-border"
                        style={{ backgroundColor: team.secondaryColor }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your plan and billing.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                Free Plan
              </Badge>
              <span className="text-sm text-muted-foreground">Current plan</span>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-card-foreground">Free includes:</p>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                <li>Up to 15 leads per search</li>
                <li>5 outreach drafts per month</li>
                <li>Basic proposal templates</li>
              </ul>
            </div>
            <Button disabled variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Upgrade to Pro (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </CardTitle>
            <CardDescription>Configure external service connections.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="openai-key" className="text-sm">OpenAI API Key</Label>
              <Input id="openai-key" type="password" placeholder="sk-..." disabled />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="places-key" className="text-sm">Google Places API Key</Label>
              <Input id="places-key" type="password" placeholder="AIza..." disabled />
            </div>
            <p className="text-xs text-muted-foreground">
              API key configuration will be available in a future update.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage
            </CardTitle>
            <CardDescription>Your activity this month.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Leads discovered</span>
              <span className="font-medium text-card-foreground">{leads.length}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Emails drafted</span>
              <span className="font-medium text-card-foreground">{drafts.length}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Assets generated</span>
              <span className="font-medium text-card-foreground">{assets.length}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Emails sent</span>
              <span className="font-medium text-card-foreground">
                {leads.filter((l) => l.status === "sent").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account details and sign-out.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="destructive" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
