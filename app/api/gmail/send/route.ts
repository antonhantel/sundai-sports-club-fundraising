import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getGmailClient, getOAuth2Client, encodeBase64Url } from "@/lib/gmail"

async function getValidAccessToken(): Promise<{
  accessToken: string
  refreshToken: string
} | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("gmail_access_token")?.value
  const refreshToken = cookieStore.get("gmail_refresh_token")?.value

  if (!accessToken && !refreshToken) return null

  if (accessToken) {
    return { accessToken, refreshToken: refreshToken || "" }
  }

  if (refreshToken) {
    try {
      const oauth2Client = getOAuth2Client()
      oauth2Client.setCredentials({ refresh_token: refreshToken })
      const { credentials } = await oauth2Client.refreshAccessToken()

      if (credentials.access_token) {
        cookieStore.set("gmail_access_token", credentials.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 3600,
          path: "/",
        })
        return {
          accessToken: credentials.access_token,
          refreshToken: refreshToken,
        }
      }
    } catch (error) {
      console.error("Failed to refresh token:", error)
      return null
    }
  }

  return null
}

export async function POST(request: Request) {
  const tokens = await getValidAccessToken()
  if (!tokens) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
  }

  try {
    const { to, subject, body, draftId } = await request.json()

    const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken)

    // If sending a draft, use the draft send endpoint
    if (draftId) {
      const result = await gmail.users.drafts.send({
        userId: "me",
        requestBody: {
          id: draftId,
        },
      })

      return NextResponse.json({
        success: true,
        messageId: result.data.id,
        message: "Draft sent successfully",
      })
    }

    // Otherwise compose and send a new email
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      body,
    ].join("\r\n")

    const encodedMessage = encodeBase64Url(rawMessage)

    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    })

    return NextResponse.json({
      success: true,
      messageId: result.data.id,
      message: `Email sent to ${to}`,
    })
  } catch (error: unknown) {
    console.error("Gmail send error:", error)
    const status = (error as { code?: number })?.code === 401 ? 401 : 500
    return NextResponse.json(
      { error: "Failed to send email" },
      { status }
    )
  }
}
