import { NextRequest, NextResponse } from "next/server"

const AUDIENCE_QUERIES: Record<string, string[]> = {
  "Families with kids": ["restaurants", "pizza", "ice cream", "toy stores", "family entertainment"],
  "College students": ["cafes", "fast food", "gyms", "bookstores", "tech stores"],
  "Young professionals": ["restaurants", "bars", "gyms", "coworking spaces"],
  "General community": ["restaurants", "auto repair", "dentists", "insurance", "retail"],
  "Senior citizens": ["pharmacies", "restaurants", "medical offices", "grocery stores"],
}

interface HereGeocodeResult {
  items: Array<{
    position: { lat: number; lng: number }
  }>
}

interface HereDiscoverResult {
  items: Array<{
    title: string
    categories?: Array<{ name: string }>
    address?: {
      label?: string
      city?: string
      state?: string
      postalCode?: string
    }
    contacts?: Array<{
      email?: Array<{ value: string }>
      phone?: Array<{ value: string }>
    }>
  }>
}

export async function POST(req: NextRequest) {
  try {
    const { zipCode, audience, limit } = await req.json()

    if (!zipCode || !audience || !limit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const apiKey = process.env.HERE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "HERE API key not configured" }, { status: 500 })
    }

    // Step 1: Geocode zip code to lat/lng
    const geocodeUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(zipCode)}&apiKey=${apiKey}`
    const geocodeRes = await fetch(geocodeUrl)
    if (!geocodeRes.ok) {
      return NextResponse.json({ error: "Failed to geocode zip code" }, { status: 502 })
    }

    const geocodeData: HereGeocodeResult = await geocodeRes.json()
    if (!geocodeData.items?.length) {
      return NextResponse.json({ error: "Could not find location for that zip code" }, { status: 404 })
    }

    const { lat, lng } = geocodeData.items[0].position

    // Step 2: Search for businesses using audience-based queries
    const queries = AUDIENCE_QUERIES[audience] || AUDIENCE_QUERIES["General community"]
    const perQuery = Math.ceil(limit / queries.length)

    const allResults: HereDiscoverResult["items"] = []
    const seenTitles = new Set<string>()

    for (const query of queries) {
      if (allResults.length >= limit) break

      const discoverUrl = `https://discover.search.hereapi.com/v1/discover?at=${lat},${lng}&q=${encodeURIComponent(query)}&limit=${perQuery}&apiKey=${apiKey}`
      const discoverRes = await fetch(discoverUrl)
      if (!discoverRes.ok) continue

      const discoverData: HereDiscoverResult = await discoverRes.json()
      for (const item of discoverData.items || []) {
        if (allResults.length >= limit) break
        const normalizedTitle = item.title.toLowerCase()
        if (!seenTitles.has(normalizedTitle)) {
          seenTitles.add(normalizedTitle)
          allResults.push(item)
        }
      }
    }

    // Step 3: Transform to Lead objects
    const leads = allResults.map((item, i) => {
      const category = item.categories?.[0]?.name || "Local Business"
      const city = item.address?.city || ""
      const state = item.address?.state || ""
      const location = [city, state].filter(Boolean).join(", ")
      const email = item.contacts?.[0]?.email?.[0]?.value || ""
      const phone = item.contacts?.[0]?.phone?.[0]?.value || ""

      return {
        id: `lead-here-${Date.now()}-${i}`,
        companyName: item.title,
        category,
        contact: phone ? `Phone: ${phone}` : "",
        email,
        location: location || item.address?.label || zipCode,
        fitReason: `Found via ${audience} audience search in ${zipCode}. Category: ${category}.`,
        status: "new" as const,
        notes: "",
        createdAt: new Date().toISOString().split("T")[0],
      }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error("Lead discovery error:", error)
    return NextResponse.json({ error: "Failed to discover leads" }, { status: 500 })
  }
}
