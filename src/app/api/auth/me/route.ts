import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, DEV_USER, isDbError } from "@/lib/auth";

// GET /api/auth/me — get current authenticated user
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    try {
      const user = await db.user.findUnique({
        where: { id: sessionUser.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
          kycStatus: true,
          kycLevel: true,
          phoneVerified: true,
          referralCode: true,
          createdAt: true,
          wallets: {
            select: {
              currency: true,
              balance: true,
              reserved: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
      }

      return NextResponse.json({ user });
    } catch (dbError) {
      if (isDbError(dbError)) {
        console.warn("[me] DB unavailable, returning dev user");
        return NextResponse.json({
          user: {
            id: DEV_USER.id,
            firstName: DEV_USER.firstName,
            lastName: DEV_USER.lastName,
            email: DEV_USER.email,
            phone: DEV_USER.phone,
            country: DEV_USER.country,
            kycStatus: DEV_USER.kycStatus,
            kycLevel: DEV_USER.kycLevel,
            phoneVerified: DEV_USER.phoneVerified,
            referralCode: DEV_USER.referralCode,
            createdAt: DEV_USER.createdAt,
            wallets: [
              { currency: "EUR", balance: 150.0, reserved: 0 },
              { currency: "USD", balance: 75.5, reserved: 0 },
              { currency: "CHF", balance: 0, reserved: 0 },
            ],
          },
          devMode: true,
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[me]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
