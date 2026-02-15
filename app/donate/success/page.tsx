import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default async function DonateSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>
            Your donation has been received successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session_id && (
            <p className="text-xs text-muted-foreground">
              Transaction ID: {session_id}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/donate">Make Another Donation</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
