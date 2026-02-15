"use client"

import Link from "next/link"
import { useApp } from "@/lib/store"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Send, Target, Search, Sparkles, Clock } from "lucide-react"
import { mockLogs } from "@/lib/mock-data"

const actionLabels: Record<string, string> = {
  lead_discovery: "Lead Discovery",
  outreach_generated: "Outreach Generated",
  gmail_draft: "Gmail Draft Created",
}

export default function DashboardHome() {
  const { leads, drafts, team } = useApp()

  const totalLeads = leads.length
  const approvedLeads = leads.filter((l) => l.status === "approved").length
  const draftedCount = drafts.length
  const sentCount = leads.filter((l) => l.status === "sent").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back{team?.name ? `, ${team.name}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here{"'"}s your fundraising overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={totalLeads} description="Local sponsors found" icon={Users} />
        <StatCard title="Approved" value={approvedLeads} description="Ready for outreach" icon={Target} />
        <StatCard title="Drafts Generated" value={draftedCount} description="Emails & proposals" icon={FileText} />
        <StatCard title="Sent" value={sentCount} description="Outreach completed" icon={Send} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into the most common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button className="w-full justify-start gap-2" asChild>
              <Link href="/dashboard/leads">
                <Search className="h-4 w-4" />
                View & manage leads
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/dashboard/assets">
                <Sparkles className="h-4 w-4" />
                View marketing assets
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions from your co-pilot.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {mockLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      {actionLabels[log.action] || log.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{log.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
