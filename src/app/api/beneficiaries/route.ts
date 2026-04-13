import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, isDbError } from "@/lib/auth";

const CreateBeneficiarySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  type: z.enum(["iban", "sort_code", "mobile_money", "bank"]),
  currency: z.string().length(3),
  country: z.string().min(2).max(50),
  iban: z.string().optional(),
  bic: z.string().optional(),
  bankName: z.string().optional(),
  bankCode: z.string().optional(),
  accountNumber: z.string().optional(),
  sortCode: z.string().optional(),
  phone: z.string().optional(),
});

// ─────────────────────────────────────────────
// Mock beneficiaries for dev mode
// ─────────────────────────────────────────────

const MOCK_BENEFICIARIES = [
  {
    id: "dev-ben-001",
    userId: "dev-user-001",
    name: "Marie Kabila",
    type: "mobile_money",
    currency: "USD",
    country: "CD",
    iban: null,
    bic: null,
    bankName: null,
    bankCode: null,
    accountNumber: null,
    sortCode: null,
    phone: "+243812345678",
    isFavorite: true,
    lastUsedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dev-ben-002",
    userId: "dev-user-001",
    name: "David Mouanda",
    type: "mobile_money",
    currency: "XAF",
    country: "CG",
    iban: null,
    bic: null,
    bankName: null,
    bankCode: null,
    accountNumber: null,
    sortCode: null,
    phone: "+242061234567",
    isFavorite: false,
    lastUsedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "dev-ben-003",
    userId: "dev-user-001",
    name: "Paulo Santos",
    type: "mobile_money",
    currency: "AOA",
    country: "AO",
    iban: null,
    bic: null,
    bankName: null,
    bankCode: null,
    accountNumber: null,
    sortCode: null,
    phone: "+244923456789",
    isFavorite: false,
    lastUsedAt: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// GET /api/beneficiaries
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    try {
      const beneficiaries = await db.beneficiary.findMany({
        where: { userId: user.id },
        orderBy: [
          { isFavorite: "desc" },
          { lastUsedAt: "desc" },
          { createdAt: "desc" },
        ],
      });

      return NextResponse.json({ beneficiaries });
    } catch (dbError) {
      if (isDbError(dbError)) {
        console.warn("[beneficiaries/list] DB unavailable, returning mock beneficiaries");
        return NextResponse.json({ beneficiaries: MOCK_BENEFICIARIES, devMode: true });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[beneficiaries/list]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/beneficiaries
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateBeneficiarySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    try {
      // Check max beneficiaries (50)
      const count = await db.beneficiary.count({ where: { userId: user.id } });
      if (count >= 50) {
        return NextResponse.json(
          { error: "Limite de 50 bénéficiaires atteinte" },
          { status: 429 }
        );
      }

      const beneficiary = await db.beneficiary.create({
        data: {
          userId: user.id,
          ...data,
        },
      });

      return NextResponse.json({ beneficiary }, { status: 201 });
    } catch (dbError) {
      if (isDbError(dbError)) {
        console.warn("[beneficiaries/create] DB unavailable, returning mock beneficiary");
        const mockBeneficiary = {
          id: "dev-ben-" + Date.now(),
          userId: user.id,
          ...data,
          isFavorite: false,
          lastUsedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return NextResponse.json({ beneficiary: mockBeneficiary, devMode: true }, { status: 201 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[beneficiaries/create]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/beneficiaries?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    try {
      // Verify ownership
      const beneficiary = await db.beneficiary.findFirst({
        where: { id, userId: user.id },
      });

      if (!beneficiary) {
        return NextResponse.json({ error: "Bénéficiaire introuvable" }, { status: 404 });
      }

      await db.beneficiary.delete({ where: { id } });

      return NextResponse.json({ success: true });
    } catch (dbError) {
      if (isDbError(dbError)) {
        console.warn("[beneficiaries/delete] DB unavailable, returning mock success");
        return NextResponse.json({ success: true, devMode: true });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[beneficiaries/delete]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
