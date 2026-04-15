import Stripe from "stripe";

/**
 * Stripe Checkout integration — dual mode (LIVE + TEST).
 *
 * - LIVE : paiements réels (vraie CB débitée). Utilisé par le bouton principal.
 * - TEST : carte 4242 4242 4242 4242, aucun débit. Utilisé par le bouton "Mode test".
 *
 * ⚠ MCC NOTE: Stripe restreint MCC 6051 (money transmitter).
 * Adapté pour pilote <€5k/mois. Migrer vers Checkout.com post-incorporation.
 */

export type StripeMode = "live" | "test";

const LIVE_SECRET = process.env.STRIPE_SECRET_KEY || "";
const TEST_SECRET = process.env.STRIPE_TEST_SECRET_KEY || "";

const stripeLive = LIVE_SECRET
  ? new Stripe(LIVE_SECRET, { apiVersion: "2024-06-20", typescript: true })
  : null;

const stripeTest = TEST_SECRET
  ? new Stripe(TEST_SECRET, { apiVersion: "2024-06-20", typescript: true })
  : null;

export function getStripe(mode: StripeMode = "live"): Stripe | null {
  return mode === "test" ? stripeTest : stripeLive;
}

export const STRIPE_LIVE_ENABLED = !!LIVE_SECRET;
export const STRIPE_TEST_ENABLED = !!TEST_SECRET;

export interface CreateCheckoutInput {
  txRef: string;
  txId: string;
  amountMinor: number; // smallest currency unit (cents)
  currency: string;
  customerEmail?: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  mode?: StripeMode; // "live" (default) | "test"
}

export async function createCheckoutSession(input: CreateCheckoutInput) {
  const mode: StripeMode = input.mode ?? "live";
  const client = getStripe(mode);

  if (!client) {
    // Dev fallback — simulate a session so the UX still works end-to-end
    return {
      id: "cs_dev_" + input.txRef,
      url: `${input.successUrl}?dev=1`,
      devMode: true as const,
      mode,
    };
  }

  const session = await client.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.customerEmail,
    line_items: [
      {
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: input.amountMinor,
          product_data: {
            name: `Tinda Cash — Transfert ${input.txRef}${mode === "test" ? " [TEST]" : ""}`,
            description: input.description,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      txRef: input.txRef,
      txId: input.txId,
      stripeMode: mode,
    },
    payment_intent_data: {
      metadata: { txRef: input.txRef, txId: input.txId, stripeMode: mode },
      description: `Tinda Cash transfer ${input.txRef}`,
    },
    success_url: `${input.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: input.cancelUrl,
    locale: "auto",
  });

  return { id: session.id, url: session.url!, devMode: false as const, mode };
}

/**
 * Verify a Stripe webhook signature.
 * Tries LIVE webhook secret first, then TEST — so a single endpoint handles both.
 */
export function verifyWebhook(
  body: string,
  signature: string
): { event: Stripe.Event; mode: StripeMode } | null {
  const liveSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const testSecret = process.env.STRIPE_TEST_WEBHOOK_SECRET;

  if (stripeLive && liveSecret) {
    try {
      const event = stripeLive.webhooks.constructEvent(body, signature, liveSecret);
      return { event, mode: "live" };
    } catch {
      // fall through to test
    }
  }

  if (stripeTest && testSecret) {
    try {
      const event = stripeTest.webhooks.constructEvent(body, signature, testSecret);
      return { event, mode: "test" };
    } catch {
      // fall through
    }
  }

  return null;
}
