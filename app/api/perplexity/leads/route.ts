import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Lead } from "@/lib/types"

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

interface PerplexityLead {
  companyName: string
  category: string
  contact: string
  email: string
  location: string
  fitReason: string
}

function parsePerplexityResponse(text: string): PerplexityLead[] {
  const leads: PerplexityLead[] = []

  // Try to extract JSON from the response (model might wrap in markdown)
  let jsonStr = text
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    jsonStr = jsonMatch[0]
  }

  try {
    const parsed = JSON.parse(jsonStr) as unknown[]
    if (!Array.isArray(parsed)) return leads

    for (const item of parsed) {
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>
        const companyName = String(o.companyName ?? o.company_name ?? o.name ?? "").trim()
        if (!companyName) continue

        const category = String(o.category ?? o.type ?? "Business").trim()
        const contact = String(o.contact ?? o.contactName ?? "Contact").trim()
        const email = String(o.email ?? o.contactEmail ?? "").trim() || `contact@${companyName.toLowerCase().replace(/\s+/g, "")}.local`
        const location = String(o.location ?? o.address ?? o.city ?? "").trim()
        const fitReason = String(o.fitReason ?? o.fit_reason ?? o.reason ?? o.why ?? "").trim()

        leads.push({
          companyName: companyName.slice(0, 255),
          category: category.slice(0, 255) || "Business",
          contact: contact.slice(0, 255) || "Contact",
          email: email.slice(0, 255),
          location: location.slice(0, 255) || "Local",
          fitReason: fitReason.slice(0, 500) || "Potential local sponsor for youth sports.",
        })
      }
    }
  } catch {
    // Fallback: try line-by-line or regex extraction for non-JSON responses
    const lines = text.split(/\n/)
    let current: Partial<PerplexityLead> = {}
    for (const line of lines) {
      const keyVal = line.match(/^(?:[-*]?\s*)?(\w+):\s*(.+)$/i)
      if (keyVal) {
        const [, key, val] = keyVal
        const v = val.trim()
        if (key.toLowerCase().includes("company") || key.toLowerCase().includes("name")) current.companyName = v
        else if (key.toLowerCase().includes("category")) current.category = v
        else if (key.toLowerCase().includes("contact")) current.contact = v
        else if (key.toLowerCase().includes("email")) current.email = v
        else if (key.toLowerCase().includes("location") || key.toLowerCase().includes("address")) current.location = v
        else if (key.toLowerCase().includes("reason") || key.toLowerCase().includes("fit")) current.fitReason = v
      }
      if (current.companyName && Object.keys(current).length >= 4) {
        leads.push({
          companyName: (current.companyName ?? "").slice(0, 255),
          category: (current.category ?? "Business").slice(0, 255),
          contact: (current.contact ?? "Contact").slice(0, 255),
          email: (current.email ?? `contact@${(current.companyName ?? "").toLowerCase().replace(/\s+/g, "")}.local`).slice(0, 255),
          location: (current.location ?? "Local").slice(0, 255),
          fitReason: (current.fitReason ?? "Potential local sponsor.").slice(0, 500),
        })
        current = {}
      }
    }
  }

  return leads.slice(0, 5)
}

export async function POST(request: Request) {
  try {
    const token = process.env.PERPLEXITY_API_KEY
    if (!token) {
      return NextResponse.json(
        { error: "Perplexity API key not configured. Add PERPLEXITY_API_KEY to .env.local" },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to find leads." }, { status: 401 })
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, name, sport, location")
      .eq("user_id", user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    let body: { location?: string; sport?: string } = {}
    try {
      body = await request.json()
    } catch {
      // use team defaults
    }

    const location = (body.location ?? team.location ?? "local area").trim()
    const sport = (body.sport ?? team.sport ?? "youth sports").trim()

    const prompt = `You are a sponsorship research assistant. Find the top 5 potential local business sponsors for a ${sport} club in ${location}.

For each business, provide:
- companyName: Business name
- category: Type of business (e.g. Restaurant, Retail, Services)
- contact: Contact person or role if known, otherwise "Contact"
- email: Business email if publicly available, otherwise use format contact@businessname.local
- location: City/area where they operate
- fitReason: 1-2 sentences on why they are a good sponsor fit (community visibility, audience overlap, local presence, etc.)

Return ONLY a valid JSON array of exactly 5 objects, no other text. Example format:
[{"companyName":"ABC Cafe","category":"Restaurant","contact":"Manager","email":"contact@abccafe.local","location":"${location}","fitReason":"Popular local spot, family-oriented clientele."}]`

    const res = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2048,
        temperature: 0.2,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("[perplexity/leads]", res.status, errText)
      return NextResponse.json(
        { error: `Perplexity API error: ${res.status}` },
        { status: 500 }
      )
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    const content = data.choices?.[0]?.message?.content ?? ""
    const parsed = parsePerplexityResponse(content)

    const leads: Omit<Lead, "id" | "createdAt">[] = parsed.map((p) => ({
      ...p,
      status: "new" as const,
      notes: "",
    }))

    return NextResponse.json({
      success: true,
      leads,
      count: leads.length,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lead discovery failed"
    console.error("[perplexity/leads]", message, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
