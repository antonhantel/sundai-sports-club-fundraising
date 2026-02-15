import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbAssetToAsset, assetToDbAsset } from "@/lib/supabase/helpers"

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
      return NextResponse.json({ success: true, assets: [] })
    }

    // Get assets for the team
    const { data: assets, error: assetsError } = await supabase
      .from("assets")
      .select("*")
      .eq("team_id", team.id)
      .order("created_at", { ascending: false })

    if (assetsError) {
      return NextResponse.json({ error: assetsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      assets: assets ? assets.map(dbAssetToAsset) : [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, teamId, name, url } = body

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

    // TODO: For proposals - use OpenAI to generate PDF content
    // TODO: For jersey mockups - use image generation API
    // TODO: Store in Supabase storage

    const asset = {
      teamId: team.id,
      type,
      name: name || `Generated ${type} - ${new Date().toLocaleDateString()}`,
      url: url || `/assets/${type}-${Date.now()}`,
    }

    // Save to database
    const dbAsset = assetToDbAsset(asset, team.id)
    const { data: insertedAsset, error: insertError } = await supabase
      .from("assets")
      .insert(dbAsset)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      asset: dbAssetToAsset(insertedAsset),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
