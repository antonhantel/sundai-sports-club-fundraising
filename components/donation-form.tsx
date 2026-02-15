"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, DollarSign, Loader2 } from "lucide-react"
import { toast } from "sonner"

const PRESET_AMOUNTS = [25, 50, 100, 250, 500]

interface DonationFormProps {
  teamName: string
  targetAmount: number
}

export function DonationForm({ teamName, targetAmount }: DonationFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [loading, setLoading] = useState(false)

  const amount = isCustom ? parseFloat(customAmount) : selectedAmount

  async function handleSubmit() {
    if (!amount || amount < 1) {
      toast.error("Please enter an amount of at least $1")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, teamName }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Support {teamName}</CardTitle>
        <CardDescription>
          Help the team reach their ${targetAmount.toLocaleString()} fundraising goal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Select an amount</Label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                variant={!isCustom && selectedAmount === preset ? "default" : "outline"}
                className="h-11"
                onClick={() => {
                  setSelectedAmount(preset)
                  setIsCustom(false)
                  setCustomAmount("")
                }}
              >
                ${preset}
              </Button>
            ))}
            <Button
              variant={isCustom ? "default" : "outline"}
              className="h-11"
              onClick={() => {
                setIsCustom(true)
                setSelectedAmount(null)
              }}
            >
              Custom
            </Button>
          </div>
        </div>

        {isCustom && (
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Custom amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="custom-amount"
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount"
                className="pl-9"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
          </div>
        )}

        <Button
          className="h-12 w-full gap-2 text-base"
          onClick={handleSubmit}
          disabled={loading || !amount || amount < 1}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
          {loading ? "Redirecting to checkout..." : `Donate${amount && amount >= 1 ? ` $${amount}` : ""}`}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Secure payment powered by Stripe. You&apos;ll be redirected to complete your donation.
        </p>
      </CardContent>
    </Card>
  )
}
