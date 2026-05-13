import Stripe from "stripe";

const globalForStripe = globalThis as unknown as {
  stripe?: Stripe;
};

function createStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required before starting checkout.");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export function getStripeClient() {
  const stripe = globalForStripe.stripe ?? createStripeClient();

  if (process.env.NODE_ENV !== "production") {
    globalForStripe.stripe = stripe;
  }

  return stripe;
}
