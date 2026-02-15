"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Heart } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-32 text-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/sponsor-jersey-hero.png')" }}
        aria-hidden
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
        <Shield className="h-4 w-4 text-primary" />
        <span>Trusted by 200+ local teams</span>
      </div>
      <h1 className="max-w-3xl text-balance text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
        Get sponsors for your local team.
      </h1>
      <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/90 drop-shadow md:text-xl">
        We find sponsors, draft outreach, and create your proposal in minutes.
        Your fundraising co-pilot, from first email to first check.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Button size="lg" className="h-12 gap-2 px-8 text-base" asChild>
          <Link href="/auth/login">
            Start fundraising
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 gap-2 border-white/50 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
          asChild
        >
          <Link href="/donate">
            <Heart className="h-4 w-4" />
            Support a Team
          </Link>
        </Button>
      </div>
      </div>
    </section>
  )
}
