import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, isDbError } from "@/lib/auth";
import { generateTransactionRef } from "@/lib/utils";

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

const CreateTransferSchema = z.object({
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  fromAmount: z.number().positive().max(5000), // max 5000 per tx unverified
  toAmount: z.number().positive(),
  rate: z.number().positive(),
  fee: z.number().min(0),
  beneficiaryId: z.string().optional(),
  newBeneficiary: z
    .object({
      name: z.string().min(2).max(100),
      type: z.enum(["iban", "sort_code", "mobile_money", "bank"]),
      iban: z.string().optional(),
      sortCode: z.string().optional(),
      accountNumber: z.string().optional(),
      phone: z.string().optional(),
      bankCode: z.string().optional(),
      country: z.string().length(2),
      currency: z.string().length(3),
      save: z.boolean().default(false),
    })
    .optional(),
  paymentMethod: z.enum(["mpesa", "mtn", "orange", "wave", "card", "bank", "flutterwave", "sepa", "fps"]),
  fromCountry: z.string(),
  toCountry: z.string(),
});

// ─────────────────────────────────────────────
// POST /api/transfers — create a new transfer
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateTransferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // KYC check: unverified users limited to 500€ per tx
    if (
      user.kycStatus !== "approved" &&
      data.fromAmount > 500
    ) {
      return NextResponse.json(
        {
          error: "Vérifiez votre identité pour envoyer plus de 500€ par transaction",
          requiresKyc: true,
        },
        { status: 403 }
      );
    }

    try {
      // Monthly limit check
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthlyTotal = await db.transaction.aggregate({
        where: {
          userId: user.id,
          status: { in: ["completed", "processing", "pending"] },
          createdAt: { gte: monthStart },
        },
        _sum: { fromAmount: true },
      });

      const monthlyLimit = user.kycStatus === "approved" ? 10000 : 1000;
      const monthlyUsed = monthlyTotal._sum.fromAmount ?? 0;

      if (monthlyUsed + data.fromAmount > monthlyLimit) {
        return NextResponse.json(
          {
            error: `Limite mensuelle de ${monthlyLimit}€ atteinte. ${user.kycStatus !== "approved" ? "Vérifiez votre identité pour augmenter votre limite." : "Contactez le support."}`,
            remainingLimit: Math.max(0, monthlyLimit - monthlyUsed),
          },
          { status: 403 }
        );
      }

      // Handle beneficiary
      let beneficiaryId = data.beneficiaryId;

      if (!beneficiaryId && data.newBeneficiary) {
        const nb = data.newBeneficiary;
        const beneficiary = await db.beneficiary.create({
          data: {
            userId: user.id,
            name: nb.name,
            type: nb.type,
            currency: nb.currency,
            country: nb.country,
            iban: nb.iban,
            sortCode: nb.sortCode,
            accountNumber: nb.accountNumber,
            phone: nb.phone,
            bankCode: nb.bankCode,
          },
        });
        beneficiaryId = beneficiary.id;
      }

      if (!beneficiaryId) {
        return NextResponse.json(
          { error: "Bénéficiaire requis" },
          { status: 400 }
        );
      }

      // Create transaction
      const ref = generateTransactionRef();

      const transaction = await db.transaction.create({
        data: {
          ref,
          userId: user.id,
          beneficiaryId,
          fromCurrency: data.fromCurrency,
          toCurrency: data.toCurrency,
          fromAmount: data.fromAmount,
          toAmount: data.toAmount,
          fee: data.fee,
          rate: data.rate,
          paymentMethod: data.paymentMethod as any,
          fromCountry: data.fromCountry,
          toCountry: data.toCountry,
          status: "pending",
        },
      });

      // Log event
      await db.transactionEvent.create({
        data: {
          transactionId: transaction.id,
          status: "pending",
          message: "Transfert créé, en attente de paiement",
        },
      });

      // In production: trigger Flutterwave charge here
      // For now return the transaction with payment instructions
      const paymentInstructions = getPaymentInstructions(
        data.paymentMethod,
        data.fromAmount,
        data.fromCurrency,
        ref
      );

      return NextResponse.json(
        {
          success: true,
          transaction: {
            id: transaction.id,
            ref: transaction.ref,
            status: transaction.status,
            fromAmount: transaction.fromAmount,
            fromCurrency: transaction.fromCurrency,
            toAmount: transaction.toAmount,
            toCurrency: transaction.toCurrency,
            createdAt: transaction.createdAt,
          },
          paymentInstructions,
        },
        { status: 201 }
      );
    } catch (dbError) {
      if (isDbError(dbError)) {
        console.warn("[transfers/create] DB unavailable, returning mock transfer");

        const ref = generateTransactionRef();
        const mockId = "dev-tx-" + Date.now();
        const now = new Date().toISOString();

        const paymentInstructions = getPaymentInstructions(
          data.paymentMethod,
          data.fromAmount,
          data.fromCurrency,
          ref
        );

        return NextResponse.json(
          {
            success: true,
            transaction: {
              id: mockId,
              ref,
              status: "pending",
              fromAmount: data.fromAmount,
              fromCurrency: data.fromCurrency,
              toAmount: data.toAmount,
              toCurrency: data.toCurrency,
              createdAt: now,
            },
            paymentInstructions,
            devMode: true,
          },
          { status: 201 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[transfers/create]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// GET /api/transfers — list user's transfers
// ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const status = searchParams.get("status");

    try {
      const [transactions, total] = await Promise.all([
        db.transaction.findMany({
          where: {
            userId: user.id,
            ...(status ? { status: status as any } : {}),
          },
          include: {
            beneficiary: {
              select: { id: true, name: true, type: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.transaction.count({
          where: {
            userId: user.id,
            ...(status ? { status: status as any } : {}),
          },
        }),
      ]);

      return NextResponse.json({
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (dbError) {
      if (isDbError(dbError)) {
        console.warn("[transfers/list] DB unavailable, returning mock transactions");

        const now = new Date();
        const mockTransactions = [
          {
            id: "dev-tx-001",
            ref: "TC-MOCK-A1B2",
            userId: user.id,
            beneficiaryId: "dev-ben-001",
            fromCurrency: "EUR",
            toCurrency: "USD",
            fromAmount: 200,
            toAmount: 216,
            fee: 1.6,
            rate: 1.08,
            paymentMethod: "mpesa",
            fromCountry: "FR",
            toCountry: "CD",
            status: "completed",
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            beneficiary: { id: "dev-ben-001", name: "Marie Kabila", type: "mobile_money", country: "CD" },
          },
          {
            id: "dev-tx-002",
            ref: "TC-MOCK-C3D4",
            userId: user.id,
            beneficiaryId: "dev-ben-002",
            fromCurrency: "EUR",
            toCurrency: "XAF",
            fromAmount: 100,
            toAmount: 65596,
            fee: 0.99,
            rate: 655.96,
            paymentMethod: "airtel",
            fromCountry: "FR",
            toCountry: "CG",
            status: "processing",
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            beneficiary: { id: "dev-ben-002", name: "David Mouanda", type: "mobile_money", country: "CG" },
          },
          {
            id: "dev-tx-003",
            ref: "TC-MOCK-E5F6",
            userId: user.id,
            beneficiaryId: "dev-ben-003",
            fromCurrency: "EUR",
            toCurrency: "AOA",
            fromAmount: 150,
            toAmount: 147000,
            fee: 1.5,
            rate: 980,
            paymentMethod: "multicaixa",
            fromCountry: "PT",
            toCountry: "AO",
            status: "pending",
            createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
            beneficiary: { id: "dev-ben-003", name: "Paulo Santos", type: "mobile_money", country: "AO" },
          },
          {
            id: "dev-tx-004",
            ref: "TC-MOCK-G7H8",
            userId: user.id,
            beneficiaryId: "dev-ben-004",
            fromCurrency: "GBP",
            toCurrency: "USD",
            fromAmount: 100,
            toAmount: 126,
            fee: 0.99,
            rate: 1.26,
            paymentMethod: "mpesa",
            fromCountry: "GB",
            toCountry: "CD",
            status: "completed",
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            beneficiary: { id: "dev-ben-004", name: "Jean-Pierre Ntumba", type: "mobile_money", country: "CD" },
          },
        ];

        // Filter by status if provided
        const filtered = status
          ? mockTransactions.filter((t) => t.status === status)
          : mockTransactions;

        return NextResponse.json({
          transactions: filtered,
          pagination: {
            total: filtered.length,
            page: 1,
            limit: 20,
            totalPages: 1,
          },
          devMode: true,
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[transfers/list]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getPaymentInstructions(
  method: string,
  amount: number,
  currency: string,
  ref: string
): { type: string; message: string; details?: Record<string, string> } {
  const methodMap: Record<
    string,
    { type: string; message: string; details?: Record<string, string> }
  > = {
    mpesa: {
      type: "ussd",
      message: `Une demande de paiement M-Pesa a été envoyée à votre téléphone. Entrez votre PIN pour confirmer.`,
      details: { reference: ref },
    },
    mtn: {
      type: "ussd",
      message: `Composez *165# sur MTN et approuvez le paiement de ${amount} ${currency}.`,
      details: { reference: ref },
    },
    orange: {
      type: "ussd",
      message: `Composez #144# sur Orange Money et approuvez le paiement.`,
      details: { reference: ref },
    },
    wave: {
      type: "app",
      message: `Ouvrez l'application Wave et approuvez le paiement de ${amount} ${currency}.`,
      details: { reference: ref },
    },
    card: {
      type: "redirect",
      message: "Redirection vers la page de paiement sécurisé...",
      details: { reference: ref },
    },
    bank: {
      type: "wire",
      message:
        "Effectuez un virement bancaire avec la référence ci-dessous.",
      details: {
        reference: ref,
        account: "Tinda Cash Ltd",
        bankName: "Banque partenaire",
      },
    },
  };

  return (
    methodMap[method.toLowerCase()] || {
      type: "generic",
      message: "Procédez au paiement selon les instructions reçues par SMS.",
      details: { reference: ref },
    }
  );
}
