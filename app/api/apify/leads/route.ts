import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ApifyClient } from "apify-client"
import type { ApifyRunInput, ApifyPlaceResult } from "@/lib/apify-types"
import type { Lead } from "@/lib/types"

const APIFY_ACTOR_ID = "nwua9Gu5YrADL7ZDj"

// Default run input for the Apify Google Maps Scraper
const defaultRunInput: ApifyRunInput = {
  searchStringsArray: ["restaurant"],
  locationQuery: "New York, USA",
  maxCrawledPlacesPerSearch: 50,
  language: "en",
  categoryFilterWords: null,
  searchMatching: "all",
  placeMinimumStars: "",
  website: "allPlaces",
  skipClosedPlaces: false,
  scrapePlaceDetailPage: false,
  scrapeTableReservationProvider: false,
  includeWebResults: false,
  scrapeDirectories: false,
  maxQuestions: 0,
  scrapeContacts: false,
  scrapeSocialMediaProfiles: {
    facebooks: false,
    instagrams: false,
    youtubes: false,
    tiktoks: false,
    twitters: false,
  },
  maximumLeadsEnrichmentRecords: 0,
  leadsEnrichmentDepartments: null,
  maxReviews: 0,
  reviewsStartDate: null,
  reviewsSort: "newest",
  reviewsFilterString: "",
  reviewsOrigin: "all",
  scrapeReviewsPersonalData: true,
  maxImages: 0,
  scrapeImageAuthors: false,
  countryCode: null,
  city: null,
  state: null,
  county: null,
  postalCode: null,
  customGeolocation: null,
  startUrls: null,
  placeIds: null,
  allPlacesNoSearchAction: "",
}

function mapApifyPlaceToLead(item: ApifyPlaceResult, index: number): Omit<Lead, "id" | "createdAt"> | null {
  const companyName = item.title ?? item.name ?? "Unknown Business"
  const category = Array.isArray(item.categories)
    ? item.categories[0] ?? item.category ?? "Business"
    : (item.category as string) ?? "Business"
  const address = item.address ?? item.full_address ?? ""
  const location = [item.city, item.state, item.country].filter(Boolean).join(", ") || address || "Unknown"

  // Email: use scraped email, or placeholder if none (required by DB)
  let email = item.email ?? ""
  if (!email && typeof item.website === "string" && item.website) {
    try {
      const host = new URL(item.website).hostname.replace(/^www\./, "")
      email = `contact@${host}`
    } catch {
      email = `lead-${index + 1}@placeholder.local`
    }
  }
  if (!email) {
    email = `lead-${index + 1}@placeholder.local`
  }

  const contact = item.phone ?? item.phoneNumber ?? "Contact"

  return {
    companyName: String(companyName).slice(0, 255),
    category: String(category).slice(0, 255),
    contact: String(contact).slice(0, 255),
    email: String(email).slice(0, 255),
    location: String(location).slice(0, 255),
    fitReason: `Discovered via Apify lead search. ${item.website ? `Website: ${item.website}` : ""}`.trim().slice(0, 500),
    status: "new" as const,
    notes: "",
  }
}

export async function POST(request: Request) {
  try {
    const token = process.env.APIFY_API_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: "Apify API token not configured. Add APIFY_API_TOKEN to .env.local" },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    let runInput: ApifyRunInput = defaultRunInput
    try {
      const body = await request.json()
      if (body && typeof body === "object") {
        runInput = { ...defaultRunInput, ...body }
      }
    } catch {
      // Use defaults if body is invalid
    }

    const client = new ApifyClient({ token })
    const run = await client.actor(APIFY_ACTOR_ID).call(runInput)

    const leads: Omit<Lead, "id" | "createdAt">[] = []
    const dataset = client.dataset(run.defaultDatasetId)

    for await (const item of dataset.iterateItems()) {
      const place = item as ApifyPlaceResult
      const lead = mapApifyPlaceToLead(place, leads.length)
      if (lead && lead.companyName && lead.companyName !== "Unknown Business") {
        leads.push(lead)
      }
    }

    return NextResponse.json({
      success: true,
      leads,
      count: leads.length,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Apify lead fetch failed"
    console.error("[apify/leads]", message, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
