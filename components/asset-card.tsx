"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Download, FileText, Shirt, ImageIcon, Trash2, X } from "lucide-react"
import type { Asset } from "@/lib/types"
import Image from "next/image"
import { useApp } from "@/lib/store"

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
  const [imageError, setImageError] = useState(false)
  const [fullscreenImageError, setFullscreenImageError] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const { deleteAsset } = useApp()
  
  // Check if this asset type should show an image preview
  const shouldShowImage = asset.type === "jersey-mockup" || asset.type === "logo"
  const hasValidUrl = asset.url && asset.url.startsWith("http")
  
  // Reset fullscreen error when opening modal
  const handleOpenFullscreen = () => {
    setFullscreenImageError(false)
    setIsFullscreenOpen(true)
  }
  
  // Format date to be more readable
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return "Today"
      } else if (diffDays === 1) {
        return "Yesterday"
      } else if (diffDays < 7) {
        return `${diffDays} days ago`
      } else {
        return date.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric", 
          year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined 
        })
      }
    } catch {
      return dateString
    }
  }

  async function handleDownload() {
    try {
      if (!asset.url) {
        toast.error("No download URL available")
        return
      }

      toast.loading(`Downloading ${asset.name}...`, { id: "download" })

      // Fetch the image
      const response = await fetch(asset.url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      // Get the blob
      const blob = await response.blob()
      
      // Determine file extension from content type or URL
      let extension = "png"
      const contentType = response.headers.get("content-type")
      if (contentType?.includes("jpeg") || contentType?.includes("jpg")) {
        extension = "jpg"
      } else if (contentType?.includes("png")) {
        extension = "png"
      } else if (contentType?.includes("pdf")) {
        extension = "pdf"
      } else {
        // Try to get extension from URL
        const urlMatch = asset.url.match(/\.([a-z0-9]+)(?:\?|$)/i)
        if (urlMatch) {
          extension = urlMatch[1]
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      
      // Clean filename (remove special characters)
      const cleanName = asset.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      link.download = `${cleanName}.${extension}`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Downloaded ${asset.name}`, { id: "download" })
    } catch (error: any) {
      console.error("Download error:", error)
      toast.error(`Failed to download: ${error.message}`, { id: "download" })
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteAsset(asset.id)
      toast.success("Asset deleted successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete asset")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="group">
      <CardContent className="flex flex-col gap-4 p-5">
        <div 
          className={`relative flex h-28 items-center justify-center overflow-hidden rounded-lg bg-muted ${
            shouldShowImage && hasValidUrl && !imageError ? "cursor-pointer hover:opacity-90 transition-opacity" : ""
          }`}
          onClick={() => {
            if (shouldShowImage && hasValidUrl && !imageError) {
              handleOpenFullscreen()
            }
          }}
        >
            {shouldShowImage && hasValidUrl && !imageError ? (
              <Image
                src={asset.url}
                alt={asset.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <Icon className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug text-card-foreground">{asset.name}</p>
              <Badge variant="secondary" className={config.className}>
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{formatDate(asset.createdAt)}</p>
          </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Full-screen image modal */}
    {shouldShowImage && hasValidUrl && (
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="!max-w-[95vw] !max-h-[95vh] !w-[95vw] !h-[95vh] p-0 bg-black/95 border-none !translate-x-[-50%] !translate-y-[-50%] !left-[50%] !top-[50%] !flex !flex-col overflow-hidden">
          <DialogTitle className="sr-only">{asset.name}</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center p-4 flex-1">
            <button
              onClick={() => setIsFullscreenOpen(false)}
              className="absolute top-4 right-4 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {!fullscreenImageError ? (
              <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
                <Image
                  src={asset.url}
                  alt={asset.name}
                  fill
                  className="object-contain"
                  sizes="95vw"
                  unoptimized
                  onError={() => {
                    console.error("Failed to load image in fullscreen:", asset.url)
                    setFullscreenImageError(true)
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-white">
                <Icon className="h-16 w-16 text-white/50" />
                <p className="text-sm text-white/70">Failed to load image</p>
                <p className="text-xs text-white/50">{asset.name}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}
