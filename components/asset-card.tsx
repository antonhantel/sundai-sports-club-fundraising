"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Download, RefreshCw, FileText, Shirt, ImageIcon } from "lucide-react"
import type { Asset } from "@/lib/types"

const typeConfig: Record<string, { icon: typeof FileText; label: string; className: string }> = {
  proposal: {
    icon: FileText,
    label: "Proposal",
    className: "bg-blue-100 text-blue-700",
  },
  "jersey-mockup": {
    icon: Shirt,
    label: "Jersey",
    className: "bg-amber-100 text-amber-700",
  },
  logo: {
    icon: ImageIcon,
    label: "Logo",
    className: "bg-emerald-100 text-emerald-700",
  },
}

interface AssetCardProps {
  asset: Asset
}

export function AssetCard({ asset }: AssetCardProps) {
  const config = typeConfig[asset.type] || typeConfig.logo
  const Icon = config.icon

  function handleDownload() {
    // TODO: Replace with actual download
    toast.success(`Downloading ${asset.name}...`)
  }

  function handleRegenerate() {
    // TODO: Replace with API call
    toast.success("Regenerating asset...")
  }

  return (
    <Card className="group">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex h-28 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug text-card-foreground">{asset.name}</p>
            <Badge variant="secondary" className={config.className}>
              {config.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{asset.createdAt}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="sr-only">Regenerate</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
