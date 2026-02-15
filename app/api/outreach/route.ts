import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { draftToDbDraft, dbDraftToDraft } from "@/lib/supabase/helpers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { leadId, teamName, companyName, fitReason } = body

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

    // TODO: Replace with OpenAI API call
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    // const emailCompletion = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{ role: "system", content: "Generate sponsorship email..." }],
    // })

    // For now, generate mock content
    const draft = {
      leadId,
      emailSubject: `Sponsorship Opportunity - ${teamName} x ${companyName}`,
      emailBody: `Mock generated email for ${companyName}. Reason: ${fitReason}`,
      proposalText: `Mock generated proposal for ${companyName}.`,
      status: "draft" as const,
    }

    // Save to database
    const dbDraft = draftToDbDraft(draft, team.id)
    const { data: insertedDraft, error: insertError } = await supabase
      .from("outreach_drafts")
      .insert(dbDraft)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      draft: dbDraftToDraft(insertedDraft),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
