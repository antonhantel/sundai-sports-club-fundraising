import { NextRequest, NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/gmail"

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin
  const redirectUri = `${origin}/api/gmail/callback`
  const url = getAuthUrl(redirectUri)
  return NextResponse.redirect(url)
}
