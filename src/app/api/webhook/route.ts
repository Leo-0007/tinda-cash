import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature as verifyFlutterwaveSignature } from "@/lib/integrations/flutterwave";
import { verifyWebhookToken as verifyOnfidoToken } from "@/lib/integrations/onfido";

// POST /api/webhook
// Handles: Flutterwave payment callbacks + Onfido KYC callbacks
export async function POST(request: NextRequest) {
  try {
    const source = request.headers.get("x-webhook-source") ||
      (request.headers.get("x-onfido-signature") ? "onfido" : "flutterwave");

    const body = await request.text();

    if (source === "onfido" || request.headers.get("x-onfido-signature")) {
      return handleOnfidoWebhook(request, body);
    }

    // Default: Flutterwave
    return handleFlutterwaveWebhook(request, body);
  } catch (error) {
    console.error("[webhook]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// Flutterwave payment webhook
// ─────────────────────────────────────────────

async function handleFlutterwaveWebhook(
  request: NextRequest,
  body: string
): Promise<NextResponse> {
  const signature = request.headers.get("verif-hash") || "";

  // Verify signature
  if (!verifyFlutterwaveSignature(body, signature)) {
    console.warn("[webhook/flutterwave] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const { event, data } = payload;

  if (event !== "charge.completed") {
    return NextResponse.json({ received: true });
  }

  const { tx_ref, status, amount, currency } = data;

  // Find transaction by ref
  const transaction = await db.transaction.findFirst({
    where: { ref: tx_ref },
    include: { user: { select: { id: true } } },
  });

  if (!transaction) {
    console.warn(`[webhook/flutterwave] Transaction not found: ${tx_ref}`);
    return NextResponse.json({ received: true });
  }

  if (status === "successful") {
    // Verify amount matches
    if (Math.abs(amount - transaction.fromAmount) > 1) {
      await updateTransactionStatus(
        transaction.id,
        "failed",
        `Montant incorrect: reçu ${amount} ${currency}, attendu ${transaction.fromAmount} ${transaction.fromCurrency}`
      );
      return NextResponse.json({ received: true });
    }

    // Payment received — trigger EU disbursement
    await updateTransactionStatus(
      transaction.id,
      "processing",
      "Paiement reçu. Virement en cours vers le bénéficiaire."
    );

    // Queue disbursement (in production: use a queue like BullMQ)
    // For now: fire-and-forget via Wise/Airwallex
    triggerDisbursement(transaction.id).catch((err) => {
      console.error("[disbursement]", err);
    });
  } else if (status === "failed") {
    await updateTransactionStatus(
      transaction.id,
      "failed",
      "Paiement échoué côté expéditeur"
    );
  }

  return NextResponse.json({ received: true });
}

// ─────────────────────────────────────────────
// Onfido KYC webhook
// ─────────────────────────────────────────────

async function handleOnfidoWebhook(
  request: NextRequest,
  body: string
): Promise<NextResponse> {
  const token = request.headers.get("x-sha2-signature") || "";

  if (!verifyOnfidoToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const { payload: eventPayload } = payload;

  if (eventPayload?.resource_type !== "check") {
    return NextResponse.json({ received: true });
  }

  const checkId = eventPayload.object?.id;
  const result = eventPayload.object?.result;

  if (!checkId) return NextResponse.json({ received: true });

  // Find user by check ID
  const user = await db.user.findFirst({
    where: { onfidoCheckId: checkId },
    select: { id: true },
  });

  if (!user) {
    console.warn(`[webhook/onfido] User not found for check: ${checkId}`);
    return NextResponse.json({ received: true });
  }

  const kycStatus = result === "clear" ? "approved" : result === "consider" ? "rejected" : "pending";

  await db.user.update({
    where: { id: user.id },
    data: { kycStatus },
  });

  // Send notification
  await db.notification.create({
    data: {
      userId: user.id,
      type: "kyc",
      title:
        kycStatus === "approved"
          ? "Identité vérifiée ✓"
          : "Vérification d'identité",
      message:
        kycStatus === "approved"
          ? "Votre identité a été vérifiée avec succès. Limites augmentées."
          : "Votre document n'a pas pu être vérifié. Soumettez un nouveau document.",
    },
  });

  return NextResponse.json({ received: true });
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function updateTransactionStatus(
  transactionId: string,
  status: string,
  message: string
): Promise<void> {
  await db.$transaction([
    db.transaction.update({
      where: { id: transactionId },
      data: { status: status as any },
    }),
    db.transactionEvent.create({
      data: {
        transactionId,
        status: status as any,
        message,
      },
    }),
  ]);
}

async function triggerDisbursement(transactionId: string): Promise<void> {
  const transaction = await db.transaction.findUnique({
    where: { id: transactionId },
    include: {
      beneficiary: true,
    },
  });

  if (!transaction || !transaction.beneficiary) return;

  try {
    // Wise for EUR (SEPA) and GBP (FPS)
    if (
      transaction.toCurrency === "EUR" ||
      transaction.toCurrency === "GBP"
    ) {
      const wise = await import("@/lib/integrations/wise");
      const { executeEurTransfer } = wise;

      if (transaction.beneficiary.iban) {
        const result = await executeEurTransfer({
          beneficiaryIban: transaction.beneficiary.iban,
          beneficiaryName: transaction.beneficiary.name,
          amount: transaction.toAmount,
          transactionId: transaction.id,
          reference: `Tinda Cash ${transaction.ref}`,
        });

        await db.transaction.update({
          where: { id: transactionId },
          data: {
            externalRef: result.wiseTransferId.toString(),
            status: "processing",
          },
        });
      }
    }

    await updateTransactionStatus(
      transactionId,
      "completed",
      "Virement effectué avec succès"
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[disbursement error]", message);
    await updateTransactionStatus(
      transactionId,
      "failed",
      `Échec du virement: ${message}`
    );
  }
}
