import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getGmailClient, getHeader, extractEmailBody, getOAuth2Client, encodeBase64Url } from "@/lib/gmail"

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

export async function GET() {
  const tokens = await getValidAccessToken()
  if (!tokens) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
  }

  try {
    const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken)

    const listResponse = await gmail.users.drafts.list({
      userId: "me",
      maxResults: 20,
    })

    const drafts = listResponse.data.drafts || []

    const draftDetails = await Promise.all(
      drafts.map(async (draft) => {
        const detail = await gmail.users.drafts.get({
          userId: "me",
          id: draft.id!,
          format: "full",
        })

        const headers = detail.data.message?.payload?.headers || []
        const body = extractEmailBody(detail.data.message?.payload || {})

        return {
          id: detail.data.id,
          messageId: detail.data.message?.id,
          to: getHeader(headers, "To"),
          from: getHeader(headers, "From"),
          subject: getHeader(headers, "Subject"),
          date: getHeader(headers, "Date"),
          body,
          snippet: detail.data.message?.snippet,
        }
      })
    )

    return NextResponse.json({ drafts: draftDetails })
  } catch (error: unknown) {
    console.error("Gmail drafts error:", error)
    const status = (error as { code?: number })?.code === 401 ? 401 : 500
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status }
    )
  }
}

export async function POST(request: Request) {
  const tokens = await getValidAccessToken()
  if (!tokens) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
  }

  try {
    const { to, subject, body } = await request.json()

    const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken)

    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      body,
    ].join("\r\n")

    const encodedMessage = encodeBase64Url(rawMessage)

    const draft = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: encodedMessage,
        },
      },
    })

    return NextResponse.json({
      success: true,
      draftId: draft.data.id,
      message: `Draft created for ${to}`,
    })
  } catch (error: unknown) {
    console.error("Gmail create draft error:", error)
    const status = (error as { code?: number })?.code === 401 ? 401 : 500
    return NextResponse.json(
      { error: "Failed to create draft" },
      { status }
    )
  }
}
