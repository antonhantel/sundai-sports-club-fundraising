import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  const stripeClient = getStripe()

  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    console.log("Donation received:", {
      sessionId: session.id,
      amount: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency,
      teamName: session.metadata?.teamName,
      customerEmail: session.customer_details?.email,
    })
  }

  return NextResponse.json({ received: true })
}
