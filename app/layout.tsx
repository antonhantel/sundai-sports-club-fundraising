import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { AppProvider } from "@/lib/store"

import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TeamFund - Fundraising Co-Pilot for Local Sports Teams",
  description:
    "Find sponsors, draft outreach, generate proposals, and raise money for your local sports team in minutes.",
}

export const viewport: Viewport = {
  themeColor: "#0d9488",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </AppProvider>
      </body>
    </html>
  )
}
