"use client"

import { LeadsTable } from "@/components/leads-table"

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sponsor Leads</h1>
        <p className="mt-1 text-muted-foreground">
          Discover, approve, and generate outreach for local businesses.
        </p>
      </div>
      <LeadsTable />
    </div>
  )
}
