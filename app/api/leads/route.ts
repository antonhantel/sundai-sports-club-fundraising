import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbLeadToLead, leadToDbLead } from "@/lib/supabase/helpers"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ success: true, leads: [] })
    }

    // Get leads for the team
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("team_id", team.id)
      .order("created_at", { ascending: false })

    if (leadsError) {
      return NextResponse.json({ error: leadsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      leads: leads ? leads.map(dbLeadToLead) : [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { zipCode, radius = 10, leads: newLeads } = body

    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // If new leads are provided, insert them
    if (newLeads && Array.isArray(newLeads) && newLeads.length > 0) {
      const dbLeads = newLeads.map((lead: any) => leadToDbLead(lead, team.id))
      const { data: insertedLeads, error: insertError } = await supabase
        .from("leads")
        .insert(dbLeads)
        .select()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Added ${insertedLeads.length} leads`,
        leads: insertedLeads ? insertedLeads.map(dbLeadToLead) : [],
      })
    }

    // TODO: Replace with Google Places API call
    // const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=...&radius=${radius * 1609}&key=${process.env.GOOGLE_PLACES_API_KEY}`

    return NextResponse.json({
      success: true,
      message: `Searched for businesses near ${zipCode} within ${radius} miles`,
      leads: [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
