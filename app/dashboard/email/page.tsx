"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Mail,
  Inbox,
  FileEdit,
  Send,
  Loader2,
  RefreshCw,
  Plus,
  ArrowLeft,
  LogIn,
  LogOut,
  AlertCircle,
  Circle,
} from "lucide-react"

interface Email {
  id: string
  threadId: string
  snippet: string
  from: string
  to: string
  subject: string
  date: string
  body: string
  labelIds: string[]
  isUnread: boolean
}

interface Draft {
  id: string
  messageId: string
  to: string
  from: string
  subject: string
  date: string
  body: string
  snippet: string
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html")
  return doc.body.textContent || ""
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  } catch {
    return dateStr
  }
}

function extractName(fromStr: string): string {
  const match = fromStr.match(/^(.+?)\s*</)
  return match ? match[1].replace(/"/g, "") : fromStr.split("@")[0]
}

export default function EmailPage() {
  const searchParams = useSearchParams()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("inbox")

  // Inbox state
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [isLoadingInbox, setIsLoadingInbox] = useState(false)

  // Drafts state
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false)

  // Compose state
  const [showCompose, setShowCompose] = useState(false)
  const [composeTo, setComposeTo] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch("/api/gmail/status")
      const data = await res.json()
      setIsConnected(data.connected)
    } catch {
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchInbox = useCallback(async () => {
    setIsLoadingInbox(true)
    try {
      const res = await fetch("/api/gmail/inbox")
      if (res.status === 401) {
        setIsConnected(false)
        return
      }
      const data = await res.json()
      if (data.emails) {
        setEmails(data.emails)
      }
    } catch {
      toast.error("Failed to load inbox")
    } finally {
      setIsLoadingInbox(false)
    }
  }, [])

  const fetchDrafts = useCallback(async () => {
    setIsLoadingDrafts(true)
    try {
      const res = await fetch("/api/gmail/drafts")
      if (res.status === 401) {
        setIsConnected(false)
        return
      }
      const data = await res.json()
      if (data.drafts) {
        setDrafts(data.drafts)
      }
    } catch {
      toast.error("Failed to load drafts")
    } finally {
      setIsLoadingDrafts(false)
    }
  }, [])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      setIsConnected(true)
      setIsLoading(false)
      toast.success("Gmail connected successfully!")
    }
    if (searchParams.get("error")) {
      toast.error("Failed to connect Gmail. Please try again.")
    }
  }, [searchParams])

  useEffect(() => {
    if (isConnected) {
      fetchInbox()
      fetchDrafts()
    }
  }, [isConnected, fetchInbox, fetchDrafts])

  async function handleDisconnect() {
    try {
      await fetch("/api/gmail/disconnect", { method: "POST" })
      setIsConnected(false)
      setEmails([])
      setDrafts([])
      setSelectedEmail(null)
      setSelectedDraft(null)
      toast.success("Gmail disconnected")
    } catch {
      toast.error("Failed to disconnect")
    }
  }

  async function handleSendEmail() {
    if (!composeTo || !composeSubject) {
      toast.error("Please fill in recipient and subject")
      return
    }
    setIsSending(true)
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Email sent!")
        setShowCompose(false)
        setComposeTo("")
        setComposeSubject("")
        setComposeBody("")
        fetchInbox()
      } else {
        toast.error(data.error || "Failed to send email")
      }
    } catch {
      toast.error("Failed to send email")
    } finally {
      setIsSending(false)
    }
  }

  async function handleSaveDraft() {
    if (!composeTo && !composeSubject && !composeBody) {
      toast.error("Cannot save empty draft")
      return
    }
    setIsSavingDraft(true)
    try {
      const res = await fetch("/api/gmail/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Draft saved!")
        setShowCompose(false)
        setComposeTo("")
        setComposeSubject("")
        setComposeBody("")
        fetchDrafts()
      } else {
        toast.error(data.error || "Failed to save draft")
      }
    } catch {
      toast.error("Failed to save draft")
    } finally {
      setIsSavingDraft(false)
    }
  }

  async function handleSendDraft(draft: Draft) {
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: draft.id }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Draft sent!")
        setSelectedDraft(null)
        fetchDrafts()
        fetchInbox()
      } else {
        toast.error(data.error || "Failed to send draft")
      }
    } catch {
      toast.error("Failed to send draft")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email</h1>
          <p className="text-muted-foreground">
            Manage your inbox, drafts, and send emails
          </p>
        </div>
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Connect Gmail</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-sm text-muted-foreground">
              Connect your Gmail account to view your inbox, manage drafts, and
              send emails directly from the dashboard.
            </p>
            <Button asChild className="w-full gap-2">
              <a href="/api/gmail/auth">
                <LogIn className="h-4 w-4" />
                Connect Gmail Account
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Compose view
  if (showCompose) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCompose(false)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">New Email</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">To</label>
              <Input
                placeholder="recipient@example.com"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Subject
              </label>
              <Input
                placeholder="Email subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Body
              </label>
              <Textarea
                placeholder="Write your email..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                rows={12}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSendEmail}
                disabled={isSending}
                className="gap-2"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="gap-2"
              >
                {isSavingDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileEdit className="h-4 w-4" />
                )}
                Save as Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Email detail view
  if (selectedEmail) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedEmail(null)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-lg">
                {selectedEmail.subject || "(No subject)"}
              </CardTitle>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">From:</span>{" "}
                  {selectedEmail.from}
                </p>
                <p>
                  <span className="font-medium text-foreground">To:</span>{" "}
                  {selectedEmail.to}
                </p>
                <p>
                  <span className="font-medium text-foreground">Date:</span>{" "}
                  {new Date(selectedEmail.date).toLocaleString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {selectedEmail.body.includes("<") ? (
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {selectedEmail.body || selectedEmail.snippet}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Draft detail view
  if (selectedDraft) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDraft(null)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-lg">
                {selectedDraft.subject || "(No subject)"}
              </CardTitle>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                {selectedDraft.to && (
                  <p>
                    <span className="font-medium text-foreground">To:</span>{" "}
                    {selectedDraft.to}
                  </p>
                )}
                {selectedDraft.date && (
                  <p>
                    <span className="font-medium text-foreground">Date:</span>{" "}
                    {new Date(selectedDraft.date).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-col gap-4 pt-4">
            {selectedDraft.body.includes("<") ? (
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: selectedDraft.body }}
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {selectedDraft.body || selectedDraft.snippet}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => handleSendDraft(selectedDraft)}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Send Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main email list view
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email</h1>
          <p className="text-muted-foreground">
            Manage your inbox, drafts, and send emails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompose(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Compose
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            className="gap-2 text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
            {emails.filter((e) => e.isUnread).length > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {emails.filter((e) => e.isUnread).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-2">
            <FileEdit className="h-4 w-4" />
            Drafts
            {drafts.length > 0 && (
              <span className="ml-1 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs">
                {drafts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Inbox</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchInbox}
                disabled={isLoadingInbox}
              >
                {isLoadingInbox ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingInbox && emails.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : emails.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Your inbox is empty
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  {emails.map((email, idx) => (
                    <div key={email.id}>
                      {idx > 0 && <Separator />}
                      <button
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                        onClick={() => setSelectedEmail(email)}
                      >
                        {email.isUnread && (
                          <Circle className="mt-1.5 h-2 w-2 flex-shrink-0 fill-primary text-primary" />
                        )}
                        <div
                          className={`flex min-w-0 flex-1 flex-col gap-0.5 ${!email.isUnread ? "ml-5" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`truncate text-sm ${email.isUnread ? "font-semibold text-foreground" : "text-foreground"}`}
                            >
                              {extractName(email.from)}
                            </span>
                            <span className="flex-shrink-0 text-xs text-muted-foreground">
                              {formatDate(email.date)}
                            </span>
                          </div>
                          <span
                            className={`truncate text-sm ${email.isUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}
                          >
                            {email.subject || "(No subject)"}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {email.snippet}
                          </span>
                        </div>
                      </button>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Drafts</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchDrafts}
                disabled={isLoadingDrafts}
              >
                {isLoadingDrafts ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingDrafts && drafts.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : drafts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <FileEdit className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No drafts yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCompose(true)}
                    className="mt-2 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Compose Email
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  {drafts.map((draft, idx) => (
                    <div key={draft.id}>
                      {idx > 0 && <Separator />}
                      <button
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                        onClick={() => setSelectedDraft(draft)}
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium text-foreground">
                              {draft.to || "No recipient"}
                            </span>
                            <span className="flex-shrink-0 text-xs text-muted-foreground">
                              {formatDate(draft.date)}
                            </span>
                          </div>
                          <span className="truncate text-sm text-muted-foreground">
                            {draft.subject || "(No subject)"}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {draft.snippet}
                          </span>
                        </div>
                      </button>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
