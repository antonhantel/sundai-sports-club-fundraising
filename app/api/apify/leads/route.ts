import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ApifyClient } from "apify-client"
import type { ApifyRunInput, ApifyPlaceResult } from "@/lib/apify-types"
import type { Lead } from "@/lib/types"

const APIFY_ACTOR_ID = "nwua9Gu5YrADL7ZDj"

// Default run input matching the official Apify Google Maps Scraper docs exactly.
// Only include documented fields to avoid validation errors.
const defaultRunInput: ApifyRunInput = {
  searchStringsArray: ["restaurant"],
  locationQuery: "New York, USA",
  maxCrawledPlacesPerSearch: 50,
  language: "en",
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
  maxReviews: 0,
  reviewsSort: "newest",
  reviewsFilterString: "",
  reviewsOrigin: "all",
  scrapeReviewsPersonalData: true,
  maxImages: 0,
  scrapeImageAuthors: false,
  allPlacesNoSearchAction: "",
}

function mapApifyPlaceToLead(item: ApifyPlaceResult, index: number): Omit<Lead, "id" | "createdAt"> | null {
  const companyName = item.title ?? item.name ?? "Unknown Business"
  const category = Array.isArray(item.categories)
    ? item.categories[0] ?? item.category ?? "Business"
    : (item.category as string) ?? "Business"
  const address = item.address ?? item.full_address ?? ""
  const location = [item.city, item.state, item.country].filter(Boolean).join(", ") || address || "Unknown"

  const website = typeof item.website === "string" ? item.website : (typeof item.url === "string" ? item.url : undefined)
  const phone = item.phone ?? item.phoneNumber ?? undefined

  let rating: number | undefined
  if (typeof item.rating === "number") rating = item.rating
  else if (typeof item.rating === "string") {
    const parsed = parseFloat(item.rating)
    if (!isNaN(parsed)) rating = parsed
  } else if (typeof item.totalScore === "number") rating = item.totalScore

  const reviewCount = typeof item.reviews === "number"
    ? item.reviews
    : typeof item.reviewsCount === "number"
      ? item.reviewsCount
      : undefined

  // Email: use scraped email, or placeholder if none (required by DB)
  let email = item.email ?? ""
  if (!email && website) {
    try {
      const host = new URL(website).hostname.replace(/^www\./, "")
      email = `contact@${host}`
    } catch {
      email = `lead-${index + 1}@placeholder.local`
    }
  }
  if (!email) {
    email = `lead-${index + 1}@placeholder.local`
  }

  const contact = phone ?? "Contact"

  return {
    companyName: String(companyName).slice(0, 255),
    category: String(category).slice(0, 255),
    contact: String(contact).slice(0, 255),
    email: String(email).slice(0, 255),
    location: String(location).slice(0, 255),
    fitReason: `Discovered via Apify lead search. ${website ? `Website: ${website}` : ""}`.trim().slice(0, 500),
    status: "new" as const,
    notes: "",
    website: website?.slice(0, 500),
    phone: phone?.slice(0, 100),
    rating,
    reviewCount,
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to pull leads." }, { status: 401 })
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    let body: Record<string, unknown> = {}
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      // Use defaults if body is invalid
    }

    // Apify token: user-provided in dialog, or server env (fixes "Unauthorized" when env is wrong)
    const apifyToken = typeof body.apifyToken === "string" && body.apifyToken.trim()
      ? body.apifyToken.trim()
      : process.env.APIFY_API_TOKEN

    if (!apifyToken) {
      return NextResponse.json(
        {
          error: "Apify API token required. Enter your token in the dialog, or add APIFY_API_TOKEN to .env.local",
        },
        { status: 401 }
      )
    }

    // Only pick user-overridable fields to avoid sending unknown fields to Apify
    const runInput: ApifyRunInput = {
      ...defaultRunInput,
      ...(Array.isArray(body.searchStringsArray) && body.searchStringsArray.length > 0
        ? { searchStringsArray: body.searchStringsArray }
        : {}),
      ...(typeof body.locationQuery === "string" && body.locationQuery.trim()
        ? { locationQuery: body.locationQuery.trim() }
        : {}),
      ...(typeof body.maxCrawledPlacesPerSearch === "number"
        ? { maxCrawledPlacesPerSearch: body.maxCrawledPlacesPerSearch }
        : {}),
    }

    const client = new ApifyClient({ token: apifyToken })
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
