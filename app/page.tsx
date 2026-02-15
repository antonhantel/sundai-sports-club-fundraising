import { LandingHero } from "@/components/landing-hero"
import { HowItWorks } from "@/components/how-it-works"
import { JerseyGallery } from "@/components/jersey-gallery"
import { StatsStrip } from "@/components/stats-strip"
import { LandingFooter } from "@/components/landing-footer"
import { Trophy } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">TeamFund</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/donate"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Donate
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <LandingHero />
        <StatsStrip />
        <HowItWorks />
        <JerseyGallery />
      </main>
      <LandingFooter />
    </div>
  )
}
