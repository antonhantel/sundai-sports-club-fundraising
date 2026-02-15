"use client"

import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LogOut, CreditCard, Key, BarChart3 } from "lucide-react"

export default function SettingsPage() {
  const { user, team, leads, drafts, assets, logout } = useApp()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push("/")
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
            <CardTitle>Team Profile</CardTitle>
            <CardDescription>Your team details as entered during onboarding.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
