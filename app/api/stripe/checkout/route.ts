import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const { amount, teamName } = await req.json()

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Amount must be at least $1" },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Donation to ${teamName}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        teamName,
        donationAmount: String(amount),
      },
      success_url: `${req.nextUrl.origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/donate/cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
