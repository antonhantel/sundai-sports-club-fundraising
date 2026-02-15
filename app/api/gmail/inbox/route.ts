import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getGmailClient, getHeader, extractEmailBody, getOAuth2Client } from "@/lib/gmail"

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

  // Access token expired, try to refresh
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

export async function GET(request: NextRequest) {
  const tokens = await getValidAccessToken()
  if (!tokens) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
  }

  const maxResults = request.nextUrl.searchParams.get("maxResults") || "20"
  const pageToken = request.nextUrl.searchParams.get("pageToken") || undefined

  try {
    const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken)

    const listResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults: parseInt(maxResults),
      pageToken,
      labelIds: ["INBOX"],
    })

    const messages = listResponse.data.messages || []

    const emailDetails = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "full",
        })

        const headers = detail.data.payload?.headers || []
        const body = extractEmailBody(detail.data.payload || {})

        return {
          id: detail.data.id,
          threadId: detail.data.threadId,
          snippet: detail.data.snippet,
          from: getHeader(headers, "From"),
          to: getHeader(headers, "To"),
          subject: getHeader(headers, "Subject"),
          date: getHeader(headers, "Date"),
          body,
          labelIds: detail.data.labelIds || [],
          isUnread: detail.data.labelIds?.includes("UNREAD") || false,
        }
      })
    )

    return NextResponse.json({
      emails: emailDetails,
      nextPageToken: listResponse.data.nextPageToken,
      resultSizeEstimate: listResponse.data.resultSizeEstimate,
    })
  } catch (error: unknown) {
    console.error("Gmail inbox error:", error)
    const status = (error as { code?: number })?.code === 401 ? 401 : 500
    return NextResponse.json(
      { error: "Failed to fetch inbox" },
      { status }
    )
  }
}
