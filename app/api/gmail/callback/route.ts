import { NextRequest, NextResponse } from "next/server"
import { getOAuth2Client } from "@/lib/gmail"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/email?error=no_code", request.url)
    )
  }

  try {
    // Use the same redirect URI that was used to generate the auth URL
    const origin = request.nextUrl.origin
    const redirectUri = `${origin}/api/gmail/callback`
    const oauth2Client = getOAuth2Client(redirectUri)
    const { tokens } = await oauth2Client.getToken(code)

    const cookieStore = await cookies()

    if (tokens.access_token) {
      cookieStore.set("gmail_access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600, // 1 hour
        path: "/",
      })
    }

    if (tokens.refresh_token) {
      cookieStore.set("gmail_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 3600, // 30 days
        path: "/",
      })
    }

    return NextResponse.redirect(
      new URL("/dashboard/email?connected=true", request.url)
    )
  } catch (error) {
    console.error("Gmail OAuth error:", error)
    return NextResponse.redirect(
      new URL("/dashboard/email?error=auth_failed", request.url)
    )
  }
}
