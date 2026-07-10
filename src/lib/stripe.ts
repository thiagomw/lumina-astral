import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(chave, { apiVersion: "2026-06-24.dahlia" });
  }

  return stripeClient;
}
