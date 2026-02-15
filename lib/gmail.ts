import { google } from "googleapis"

export function getOAuth2Client(redirectUri?: string) {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri || process.env.GOOGLE_REDIRECT_URI
  )
}

export function getAuthUrl(redirectUri: string) {
  const oauth2Client = getOAuth2Client(redirectUri)
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.modify",
    ],
  })
}

export function getGmailClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  return google.gmail({ version: "v1", auth: oauth2Client })
}

export function decodeBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8")
}

export function encodeBase64Url(data: string): string {
  return Buffer.from(data).toString("base64url")
}

interface EmailHeader {
  name?: string | null
  value?: string | null
}

export function getHeader(headers: EmailHeader[], name: string): string {
  const header = headers.find(
    (h) => h.name?.toLowerCase() === name.toLowerCase()
  )
  return header?.value || ""
}

interface PayloadPart {
  mimeType?: string | null
  body?: { data?: string | null } | null
  parts?: PayloadPart[] | null
}

interface MessagePayload {
  mimeType?: string | null
  body?: { data?: string | null } | null
  parts?: PayloadPart[] | null
}

export function extractEmailBody(payload: MessagePayload): string {
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data)
  }

  if (payload.parts) {
    // Prefer HTML, then plain text
    const htmlPart = payload.parts.find((p: PayloadPart) => p.mimeType === "text/html")
    if (htmlPart?.body?.data) {
      return decodeBase64Url(htmlPart.body.data)
    }

    const textPart = payload.parts.find((p: PayloadPart) => p.mimeType === "text/plain")
    if (textPart?.body?.data) {
      return decodeBase64Url(textPart.body.data)
    }

    // Check nested parts (multipart/alternative inside multipart/mixed)
    for (const part of payload.parts) {
      if (part.parts) {
        const nestedHtml = part.parts.find((p: PayloadPart) => p.mimeType === "text/html")
        if (nestedHtml?.body?.data) {
          return decodeBase64Url(nestedHtml.body.data)
        }
        const nestedText = part.parts.find((p: PayloadPart) => p.mimeType === "text/plain")
        if (nestedText?.body?.data) {
          return decodeBase64Url(nestedText.body.data)
        }
      }
    }
  }

  return ""
}
