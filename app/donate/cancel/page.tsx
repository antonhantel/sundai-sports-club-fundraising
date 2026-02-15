import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"

export default function DonateCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">Donation Cancelled</CardTitle>
          <CardDescription>
            Your donation was not processed. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/donate">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
