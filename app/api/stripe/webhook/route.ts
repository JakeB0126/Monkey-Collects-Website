import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { confirmPaidOrderFromStripeCheckout } from "@/lib/orders";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

function getOrderId(session: Stripe.Checkout.Session) {
  return session.metadata?.orderId || session.client_reference_id;
}

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  if (typeof session.payment_intent === "string") {
    return session.payment_intent;
  }

  return session.payment_intent?.id ?? null;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is required before handling Stripe webhooks.");
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const stripe = getStripeClient();
  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature.";

    console.error(`Stripe webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    console.error(`Checkout session ${session.id} completed without paid status: ${session.payment_status}.`);
    return NextResponse.json({ received: true });
  }

  const orderId = getOrderId(session);

  if (!orderId) {
    console.error(`Checkout session ${session.id} completed without an order id.`);
    return NextResponse.json({ error: "Missing order id." }, { status: 400 });
  }

  let result: Awaited<ReturnType<typeof confirmPaidOrderFromStripeCheckout>>;

  try {
    result = await confirmPaidOrderFromStripeCheckout({
      orderId,
      customerEmail: session.customer_details?.email || session.customer_email,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: getPaymentIntentId(session)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout session could not be confirmed.";

    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (result.status === "inventory_failed") {
    console.error(result.message);
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, result });
}
