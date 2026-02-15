import { NextResponse } from "next/server"

// TODO: Replace with Gmail API integration
// Requires: googleapis package, OAuth2 tokens with gmail.compose scope

export async function POST(request: Request) {
  const body = await request.json()
  const { to, subject, htmlBody } = body

  // TODO: Replace with Gmail API call
  // const auth = new google.auth.OAuth2(...)
  // const gmail = google.gmail({ version: "v1", auth })
  // const raw = Buffer.from(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html\r\n\r\n${htmlBody}`).toString("base64url")
  // await gmail.users.drafts.create({ userId: "me", requestBody: { message: { raw } } })

  // Simulate delay
  await new Promise((r) => setTimeout(r, 500))

  return NextResponse.json({
    success: true,
    message: `Gmail draft created for ${to}`,
    draftId: `mock-draft-${Date.now()}`,
  })
}
