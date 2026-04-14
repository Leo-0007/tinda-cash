import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/integrations/stripe";
import { db } from "@/lib/db";
import { isDbError } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const rawBody = await req.text();

  const event = verifyWebhook(rawBody, signature);
  if (!event) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session: any = event.data.object;
        const txRef = session.metadata?.txRef;
        const txId = session.metadata?.txId;
        if (!txRef) break;

        try {
          await db.transaction.update({
            where: txId && !txId.startsWith("dev-") ? { id: txId } : { ref: txRef },
            data: {
              status: "awaiting_manual_processing" as any,
              externalRef: session.payment_intent as string,
            },
          });
          await db.transactionEvent.create({
            data: {
              transactionId: txId,
              status: "awaiting_manual_processing" as any,
              message: "Paiement Stripe confirmé — en attente d'exécution manuelle",
            },
          });
        } catch (e) {
          if (!isDbError(e)) throw e;
        }
        break;
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const obj: any = event.data.object;
        const txRef = obj.metadata?.txRef;
        if (!txRef) break;
        try {
          await db.transaction.update({
            where: { ref: txRef },
            data: { status: "failed" as any },
          });
        } catch (e) {
          if (!isDbError(e)) throw e;
        }
        break;
      }
    }
  } catch (err) {
    console.error("[stripe/webhook]", err);
    return NextResponse.json({ received: true, error: "handler_error" });
  }

  return NextResponse.json({ received: true });
}
