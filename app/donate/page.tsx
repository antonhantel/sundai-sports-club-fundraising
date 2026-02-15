import { DonationForm } from "@/components/donation-form"
import { Trophy } from "lucide-react"
import Link from "next/link"

export default function DonatePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">TeamFund</span>
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pt-24 pb-12">
        <DonationForm teamName="Riverside Thunder" targetAmount={15000} />
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TeamFund. All rights reserved.</p>
      </footer>
    </div>
  )
}
