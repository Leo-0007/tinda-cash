import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, isDbError } from "@/lib/auth";
import { generateTransactionRef } from "@/lib/utils";
import { createCheckoutSession } from "@/lib/integrations/stripe";

const schema = z.object({
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  fromAmount: z.number().positive().max(5000),
  toAmount: z.number().positive(),
  rate: z.number().positive(),
  fee: z.number().min(0),
  fromCountry: z.string().length(2),
  toCountry: z.string().length(2),
  recipientName: z.string().min(2).max(100),
  recipientPhone: z.string().min(4).max(32),
  deliveryMethod: z.string().min(2).max(64),
  testMode: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const d = parsed.data;

    // KYC gate: unverified users cannot send > 150€ (AMLD threshold)
    if (user.kycStatus !== "approved" && d.fromAmount > 150) {
      return NextResponse.json(
        { error: "kyc_required", requiresKyc: true, limit: 150 },
        { status: 403 }
      );
    }

    const ref = generateTransactionRef();
    const total = d.fromAmount + d.fee;
    const amountMinor = Math.round(total * 100);

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      `https://${req.headers.get("host")}`;

    let txId = "dev-tx-" + Date.now();

    // Persist pending transaction (best-effort, fallback to mock)
    try {
      // Upsert beneficiary (lightweight: mobile_money / phone)
      const ben = await db.beneficiary.create({
        data: {
          userId: user.id,
          name: d.recipientName,
          type: "mobile_money",
          currency: d.toCurrency,
          country: d.toCountry,
          phone: d.recipientPhone,
        },
      });

      const tx = await db.transaction.create({
        data: {
          ref,
          userId: user.id,
          beneficiaryId: ben.id,
          fromCurrency: d.fromCurrency,
          toCurrency: d.toCurrency,
          fromAmount: d.fromAmount,
          toAmount: d.toAmount,
          fee: d.fee,
          rate: d.rate,
          paymentMethod: "card" as any,
          fromCountry: d.fromCountry,
          toCountry: d.toCountry,
          status: "pending",
        },
      });
      txId = tx.id;

      await db.transactionEvent.create({
        data: {
          transactionId: tx.id,
          status: "pending",
          message: "Transaction créée — en attente de paiement Stripe",
        },
      });
    } catch (e) {
      if (!isDbError(e)) throw e;
      console.warn("[checkout] DB unavailable, running in dev mock mode");
    }

    const stripeMode = d.testMode ? "test" : "live";

    const session = await createCheckoutSession({
      txRef: ref,
      txId,
      amountMinor,
      currency: d.fromCurrency,
      customerEmail: user.email,
      description: `${d.recipientName} · ${d.toCountry} · ${d.deliveryMethod}`,
      successUrl: `${origin}/transfer/${ref}`,
      cancelUrl: `${origin}/send?cancelled=1`,
      mode: stripeMode,
    });

    return NextResponse.json({
      ok: true,
      ref,
      txId,
      checkoutUrl: session.url,
      devMode: session.devMode,
      stripeMode,
    });
  } catch (err: any) {
    console.error("[api/checkout]", err);
    return NextResponse.json(
      { error: "server_error", message: err?.message || "unknown" },
      { status: 500 }
    );
  }
}
