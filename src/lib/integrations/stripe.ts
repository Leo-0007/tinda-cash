import Stripe from "stripe";

/**
 * Stripe Checkout integration — used for sender collection (card / Apple Pay / Google Pay).
 *
 * ⚠ MCC NOTE: Stripe historically restricts MCC 6051 (money transmitter).
 * This integration is suitable for a low-volume pilot (<€5k/month).
 * Migrate to Checkout.com or Adyen post-incorporation for production scale.
 */

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";

export const stripe = STRIPE_SECRET
  ? new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20", typescript: true })
  : null;

export const STRIPE_ENABLED = !!STRIPE_SECRET;

export interface CreateCheckoutInput {
  txRef: string;
  txId: string;
  amountMinor: number; // in smallest currency unit (cents)
  currency: string;
  customerEmail?: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(input: CreateCheckoutInput) {
  if (!stripe) {
    // Dev fallback — simulate a session so the UX still works end-to-end
    return {
      id: "cs_dev_" + input.txRef,
      url: `${input.successUrl}?dev=1`,
      devMode: true as const,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.customerEmail,
    line_items: [
      {
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: input.amountMinor,
          product_data: {
            name: `Tinda Cash — Transfert ${input.txRef}`,
            description: input.description,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      txRef: input.txRef,
      txId: input.txId,
    },
    payment_intent_data: {
      metadata: { txRef: input.txRef, txId: input.txId },
      description: `Tinda Cash transfer ${input.txRef}`,
    },
    success_url: `${input.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: input.cancelUrl,
    locale: "auto",
  });

  return { id: session.id, url: session.url!, devMode: false as const };
}

export function verifyWebhook(
  body: string,
  signature: string
): Stripe.Event | null {
  if (!stripe) return null;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return null;
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.warn("[stripe/webhook] signature invalid:", (err as Error).message);
    return null;
  }
}
