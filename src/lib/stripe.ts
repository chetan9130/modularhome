import Stripe from "stripe";

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_API_KEY ||
  "sk_test_placeholder_key_for_development";

/**
 * Server-side Stripe SDK Instance
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
  appInfo: {
    name: "ModularHome Architectural Blueprints",
    version: "2.0.0",
  },
});

/**
 * Checks if live/valid Stripe credentials are configured in environment
 */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return (
    Boolean(key) &&
    !key?.includes("placeholder") &&
    Boolean(key?.startsWith("sk_"))
  );
}

/**
 * Safely constructs and validates a Stripe webhook event
 */
export function constructStripeWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
