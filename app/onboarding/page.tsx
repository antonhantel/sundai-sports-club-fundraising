"use client"

import { useApp } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { OnboardingForm } from "@/components/onboarding-form"
import { Trophy } from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {
  const { user, isOnboarded } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login")
    } else if (isOnboarded) {
      router.replace("/dashboard")
    }
  }, [user, isOnboarded, router])

  if (!user || isOnboarded) return null

  return (
    <div className="min-h-screen bg-secondary px-4 py-8">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2">
          <Trophy className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">TeamFund</span>
        </Link>
        <OnboardingForm />
      </div>
    </div>
  )
}
