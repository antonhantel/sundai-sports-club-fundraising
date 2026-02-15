import { Trophy } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span className="font-semibold text-card-foreground">TeamFund</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Built for coaches, by coaches. Fundraising should be easy.
        </p>
        <p className="text-xs text-muted-foreground">
          {"TeamFund 2026. All rights reserved."}
        </p>
      </div>
    </footer>
  )
}
