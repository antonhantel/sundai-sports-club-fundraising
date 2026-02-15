"use client"

import { useState } from "react"
import { useApp } from "@/lib/store"
import { AssetCard } from "@/components/asset-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { FileText, Shirt, Loader2, Upload, ImageIcon, Video } from "lucide-react"
import type { Asset } from "@/lib/types"

export default function AssetsPage() {
  const { assets, addAsset, team } = useApp()
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false)
  const [isGeneratingJersey, setIsGeneratingJersey] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: "",
    type: "logo" as "proposal" | "jersey-mockup" | "logo" | "media",
  })

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

  async function handleUploadAsset() {
    if (!team) {
      toast.error("Please complete team setup first")
      return
    }

    if (!uploadForm.file) {
      toast.error("Please select an image file")
      return
    }

    if (!uploadForm.title.trim()) {
      toast.error("Please enter a title")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", uploadForm.file)
      formData.append("type", uploadForm.type)
      formData.append("name", uploadForm.title)

      const response = await fetch("/api/assets", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload asset")
      }

      const { asset } = await response.json()
      await addAsset(asset)
      toast.success("Asset uploaded successfully!")
      
      // Reset form and close dialog
      setUploadForm({
        file: null,
        title: "",
        type: "logo",
      })
      setIsUploadDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to upload asset")
    } finally {
      setIsUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }
      setUploadForm({ ...uploadForm, file })
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
          onClick={() => setIsUploadDialogOpen(true)}
          variant="default"
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Asset
        </Button>
        <Button
          onClick={handleGenerateProposal}
          disabled={isGeneratingProposal}
          variant="outline"
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

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Marketing Asset</DialogTitle>
            <DialogDescription>
              Upload an image file with a title and tag to add it to your marketing assets.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="file">Image File</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {uploadForm.file && (
                <p className="text-xs text-muted-foreground">
                  Selected: {uploadForm.file.name}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Team Logo 2024"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                disabled={isUploading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Tag (Type)</Label>
              <Select
                value={uploadForm.type}
                onValueChange={(value: "proposal" | "jersey-mockup" | "logo" | "media") =>
                  setUploadForm({ ...uploadForm, type: value })
                }
                disabled={isUploading}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logo">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Logo
                    </div>
                  </SelectItem>
                  <SelectItem value="jersey-mockup">
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      Jersey Mockup
                    </div>
                  </SelectItem>
                  <SelectItem value="proposal">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Proposal
                    </div>
                  </SelectItem>
                  <SelectItem value="media">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Media
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUploadAsset} disabled={isUploading || !uploadForm.file || !uploadForm.title.trim()}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
