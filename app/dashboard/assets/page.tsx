"use client"

import { useState } from "react"
import { useApp } from "@/lib/store"
import { AssetCard } from "@/components/asset-card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { FileText, Shirt, Loader2 } from "lucide-react"
import type { Asset } from "@/lib/types"

export default function AssetsPage() {
  const { assets, addAsset, team } = useApp()
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false)
  const [isGeneratingJersey, setIsGeneratingJersey] = useState(false)

  async function handleGenerateProposal() {
    setIsGeneratingProposal(true)
    // TODO: Replace with OpenAI API call
    await new Promise((r) => setTimeout(r, 1500))
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      teamId: "team-1",
      type: "proposal",
      name: `New Sponsorship Proposal - ${new Date().toLocaleDateString()}`,
      url: `/assets/proposal-${Date.now()}.pdf`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    addAsset(newAsset)
    setIsGeneratingProposal(false)
    toast.success("Proposal generated!")
  }

  async function handleGenerateJersey() {
    if (!team) {
      toast.error("Please complete team setup first")
      return
    }
    
    setIsGeneratingJersey(true)
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "jersey-mockup",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate jersey mockup")
      }

      const { asset } = await response.json()
      await addAsset(asset)
      toast.success("Jersey mockup generated!")
    } catch (error: any) {
      toast.error(error.message || "Failed to generate jersey mockup")
    } finally {
      setIsGeneratingJersey(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing Assets</h1>
        <p className="mt-1 text-muted-foreground">
          Proposals, jersey mockups, and team branding materials.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleGenerateProposal}
          disabled={isGeneratingProposal}
          className="gap-2"
        >
          {isGeneratingProposal ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Generate Proposal
        </Button>
        <Button
          onClick={handleGenerateJersey}
          disabled={isGeneratingJersey}
          variant="outline"
          className="gap-2"
          type="button"
        >
          {isGeneratingJersey ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shirt className="h-4 w-4" />
          )}
          Generate Jersey Mockup
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
        {assets.length === 0 && (
          <div className="col-span-full flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-border">
            <p className="text-muted-foreground">No assets yet. Generate your first proposal above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
