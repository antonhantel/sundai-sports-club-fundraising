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
  const body = await request.json()
  const { to, subject, htmlBody, attachments } = body

  const tokens = await getValidAccessToken()

  if (!tokens) {
    return NextResponse.json(
      { error: "not_authenticated", message: "Please connect your Gmail account first" },
      { status: 401 }
    )
  }

  try {
    const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken)

    // If there are attachments, create a multipart message
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      // Fetch and encode attachments
      const attachmentParts: string[] = []
      for (const attachmentUrl of attachments) {
        try {
          const imageResponse = await fetch(attachmentUrl)
          if (!imageResponse.ok) {
            console.warn(`Failed to fetch attachment: ${attachmentUrl}`)
            continue
          }
          
          const imageBuffer = await imageResponse.arrayBuffer()
          const imageBase64 = Buffer.from(imageBuffer).toString('base64')
          const contentType = imageResponse.headers.get('content-type') || 'image/png'
          const fileName = attachmentUrl.split('/').pop()?.split('?')[0] || 'attachment.png' // Remove query params
          
          attachmentParts.push(
            `--${boundary}`,
            `Content-Type: ${contentType}; name="${fileName}"`,
            `Content-Disposition: attachment; filename="${fileName}"`,
            `Content-Transfer-Encoding: base64`,
            '',
            imageBase64
          )
        } catch (error) {
          console.error(`Error processing attachment ${attachmentUrl}:`, error)
        }
      }
      
      // Create multipart message
      const rawMessage = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        `Content-Type: text/html; charset=utf-8`,
        `Content-Transfer-Encoding: quoted-printable`,
        '',
        htmlBody,
        ...attachmentParts,
        `--${boundary}--`,
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
        message: `Gmail draft created for ${to} with ${attachmentParts.length > 0 ? attachments.length : 0} attachment(s)`,
        draftId: draft.data.id,
      })
    } else {
      // No attachments - simple message
      const rawMessage = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/html; charset=utf-8",
        "",
        htmlBody,
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
        message: `Gmail draft created for ${to}`,
        draftId: draft.data.id,
      })
    }
  } catch (error: unknown) {
    console.error("Gmail draft creation error:", error)
    const status = (error as { code?: number })?.code === 401 ? 401 : 500
    return NextResponse.json(
      { error: "Failed to create Gmail draft" },
      { status }
    )
  }
}
