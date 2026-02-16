"use client"

import { use, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { LeadStatusBadge } from "@/components/lead-status-badge"
import { toast } from "sonner"
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Mail,
  Sparkles,
  FileText,
  Send,
  Loader2,
  RefreshCw,
  Shirt,
} from "lucide-react"
import type { OutreachDraft } from "@/lib/types"

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { leads, drafts, updateLeadStatus, updateLeadNotes, addDraft, updateDraft, assets, team, addAsset } = useApp()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isGeneratingJersey, setIsGeneratingJersey] = useState(false)
  const [notes, setNotes] = useState("")
  const notesTimeoutRef = useRef<NodeJS.Timeout>(null)

  const lead = leads.find((l) => l.id === id)
  const draft = drafts.find((d) => d.leadId === id)
  
  // Find jersey for this company (most recent jersey-mockup with company name)
  const jerseyAsset = lead
    ? assets
        .filter((asset) => asset.type === "jersey-mockup" && asset.name.includes(lead.companyName))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : undefined

  // Sync notes with lead when it changes
  useEffect(() => {
    if (lead) {
      setNotes(lead.notes)
    }
  }, [lead?.id, lead?.notes])

  if (!lead) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/leads">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to leads
          </Link>
        </Button>
      </div>
    )
  }

  async function handleGenerate() {
    try {
      setIsGenerating(true)
      // TODO: Replace with OpenAI API call
      await new Promise((r) => setTimeout(r, 1500))
      const newDraft: Omit<OutreachDraft, "id" | "createdAt"> = {
        leadId: lead!.id,
        emailSubject: `Sponsorship Opportunity - Your Team x ${lead!.companyName}`,
        emailBody: `Dear team,\n\nI'm reaching out about an exciting sponsorship opportunity with our local youth sports team. As a valued ${lead!.category.toLowerCase()} business in ${lead!.location}, we believe a partnership would be mutually beneficial.\n\n${lead!.fitReason}\n\nOur sponsorship packages include jersey logo placement, social media recognition, and event presence. I'd love to discuss how we can work together.\n\nBest regards,\nCoach Martinez`,
        proposalText: `SPONSORSHIP PROPOSAL\n\nYour Team x ${lead!.companyName}\n\nAbout Us: Local youth sports team with 120+ active families.\n\nWhy Partner: ${lead!.fitReason}\n\nSponsorship Tiers:\n- Gold ($2,500): Primary jersey logo, banner, social media\n- Silver ($1,000): Jersey sleeve, banner, newsletter\n- Bronze ($500): Banner display, newsletter mention\n\nContact: coach.martinez@gmail.com`,
        status: "draft",
      }
      await addDraft(newDraft as OutreachDraft)
      await updateLeadStatus(lead!.id, "drafted")
      toast.success("Outreach generated successfully")
    } catch (error) {
      toast.error("Failed to generate outreach")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleRegenerate() {
    setIsRegenerating(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsRegenerating(false)
    toast.success("Outreach regenerated")
  }

  function emailBodyToHtml(body: string): string {
    const escapeHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const urlPattern = /^https?:\/\/\S+$/i
    return body
      .split("\n")
      .map((line) => {
        const trimmed = line.trim()
        if (urlPattern.test(trimmed)) {
          return `<img src="${trimmed}" alt="Jersey mockup" style="max-width:100%;height:auto;display:block;margin:12px 0;" />`
        }
        return escapeHtml(line)
      })
      .join("<br>\n")
  }

  async function handleCreateGmailDraft() {
    if (!draft) return
    try {
      const htmlBody = emailBodyToHtml(draft.emailBody)
      const res = await fetch("/api/gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: lead!.email,
          subject: draft.emailSubject,
          htmlBody,
        }),
      })
      const data = await res.json()
      if (res.status === 401) {
        toast.error("Please connect your Gmail account first (go to Email page)")
        return
      }
      if (data.success) {
        toast.success("Gmail draft created! Check your drafts folder.")
      } else {
        toast.error(data.error || "Failed to create Gmail draft")
      }
    } catch {
      toast.error("Failed to create Gmail draft")
    }
  }

  async function handleMarkSent() {
    try {
      await updateLeadStatus(lead!.id, "sent")
      toast.success("Marked as sent")
    } catch (error) {
      toast.error("Failed to update lead status")
    }
  }

  async function handleGenerateJersey() {
    if (!team) {
      toast.error("Please complete team setup first")
      return
    }
    
    if (!lead) {
      toast.error("Lead not found")
      return
    }

    setIsGeneratingJersey(true)
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "jersey-mockup",
          sponsorName: lead.companyName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate jersey mockup")
      }

      const { asset } = await response.json()
      await addAsset(asset)
      // Add image directly to email draft so it appears in the Gmail draft
      const currentDraft = drafts.find((d) => d.leadId === lead.id)
      if (currentDraft) {
        const separator = currentDraft.emailBody.trimEnd() ? "\n\n" : ""
        const appendedBody = `${currentDraft.emailBody.trimEnd()}${separator}Jersey mockup:\n${asset.url}`
        await updateDraft(currentDraft.id, { emailBody: appendedBody })
      }
      toast.success("Jersey mockup generated and added to draft!")
    } catch (error: any) {
      toast.error(error.message || "Failed to generate jersey mockup")
    } finally {
      setIsGeneratingJersey(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/leads">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">{lead.companyName}</h1>
          <LeadStatusBadge status={lead.status} />
        </div>
        <p className="text-muted-foreground">{lead.category}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Company Info
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-card-foreground">{lead.contact}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-card-foreground">{lead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-card-foreground">{lead.location}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4" />
                Why They Fit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-card-foreground">{lead.fitReason}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this lead..."
                value={notes}
                onChange={(e) => {
                  const newNotes = e.target.value
                  setNotes(newNotes)
                  // Debounce the update
                  if (notesTimeoutRef.current) {
                    clearTimeout(notesTimeoutRef.current)
                  }
                  notesTimeoutRef.current = setTimeout(async () => {
                    try {
                      await updateLeadNotes(lead.id, newNotes)
                    } catch (error) {
                      toast.error("Failed to save notes")
                    }
                  }, 500)
                }}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {!draft && lead.status !== "drafted" && lead.status !== "sent" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Outreach</CardTitle>
                <CardDescription>Generate a personalized email and proposal for this lead.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2">
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate Outreach
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-4 w-4" />
                    Email Draft
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {draft && (
                    <>
                      <div className="rounded-lg bg-muted p-4">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">Subject</p>
                        <p className="text-sm font-medium text-card-foreground">{draft.emailSubject}</p>
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">Body</p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">
                          {draft.emailBody}
                        </p>
                      </div>
                    </>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleCreateGmailDraft} variant="outline" className="flex-1 gap-2">
                      <Send className="h-4 w-4" />
                      Create Gmail Draft
                    </Button>
                    <Button
                      onClick={handleRegenerate}
                      variant="ghost"
                      size="icon"
                      disabled={isRegenerating}
                    >
                      {isRegenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span className="sr-only">Regenerate</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Sponsorship Proposal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {draft && (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">
                        {draft.proposalText}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shirt className="h-4 w-4" />
                    Jersey Mockup
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {jerseyAsset ? (
                    <div className="flex flex-col gap-3">
                      <div className="relative overflow-hidden rounded-lg border">
                        <img
                          src={jerseyAsset.url}
                          alt={`Jersey mockup with ${lead.companyName}`}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {jerseyAsset.name}
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <div className="text-center">
                        <Shirt className="mx-auto h-12 w-12 text-primary" />
                        <p className="mt-2 text-xs text-muted-foreground">
                          No jersey mockup yet
                        </p>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={handleGenerateJersey}
                    disabled={isGeneratingJersey}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    {isGeneratingJersey ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Shirt className="h-4 w-4" />
                        {jerseyAsset ? "Regenerate Jersey" : "Create Jersey Mockup"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {lead.status !== "sent" && (
                <Button onClick={handleMarkSent} variant="outline" className="gap-2">
                  <Send className="h-4 w-4" />
                  Mark as Sent
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
