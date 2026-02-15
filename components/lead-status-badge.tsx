import { Badge } from "@/components/ui/badge"
import type { LeadStatus } from "@/lib/types"

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "bg-muted text-muted-foreground hover:bg-muted",
  },
  approved: {
    label: "Approved",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  drafted: {
    label: "Drafted",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
  sent: {
    label: "Sent",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}
