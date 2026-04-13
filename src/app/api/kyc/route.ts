import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, DEV_USER, isDbError } from "@/lib/auth";
import {
  createApplicant,
  generateSdkToken,
  createCheck,
  getCheck,
  interpretCheckResult,
} from "@/lib/integrations/onfido";

// POST /api/kyc — initiate KYC flow
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    try {
      // Get full user data
      const fullUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          kycStatus: true,
          onfidoApplicantId: true,
        },
      });

      if (!fullUser) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
      }

      if (fullUser.kycStatus === "approved") {
        return NextResponse.json(
          { error: "Votre identité est déjà vérifiée" },
          { status: 409 }
        );
      }

      // Create Onfido applicant if not exists
      let applicantId = fullUser.onfidoApplicantId;

      if (!applicantId) {
        const applicant = await createApplicant({
          firstName: fullUser.firstName,
          lastName: fullUser.lastName,
          email: fullUser.email || undefined,
        });
        applicantId = applicant.id;

        await db.user.update({
          where: { id: user.id },
          data: { onfidoApplicantId: applicantId },
        });
      }

      // Generate SDK token for Onfido Web SDK
      const sdkTokenData = await generateSdkToken({
        applicantId,
        referrer: `${process.env.NEXT_PUBLIC_APP_URL}/*`,
      });

      // Update KYC status to pending
      await db.user.update({
        where: { id: user.id },
        data: { kycStatus: "pending" },
      });

      return NextResponse.json({
        success: true,
        sdkToken: sdkTokenData.token,
        applicantId,
      });
    } catch (dbOrOnfidoError) {
      // If DB or Onfido is not configured, return a mock response for dev
      if (isDbError(dbOrOnfidoError) || process.env.NODE_ENV !== "production") {
        console.warn("[kyc/initiate] DB/Onfido unavailable, returning dev mock");
        return NextResponse.json({
          success: true,
          sdkToken: "dev_mock_token",
          applicantId: "dev_mock_applicant",
          devMode: true,
        });
      }
      throw dbOrOnfidoError;
    }
  } catch (error) {
    console.error("[kyc/initiate]", error);
    return NextResponse.json({ error: "Erreur lors de l'initiation KYC" }, { status: 500 });
  }
}

// GET /api/kyc — get KYC status
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    try {
      const fullUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
          kycStatus: true,
          onfidoApplicantId: true,
          onfidoCheckId: true,
        },
      });

      if (!fullUser) {
        return NextResponse.json({ error: "Introuvable" }, { status: 404 });
      }

      // If check exists and pending, poll status
      if (fullUser.onfidoCheckId && fullUser.kycStatus === "pending") {
        try {
          const check = await getCheck(fullUser.onfidoCheckId);
          const newStatus = interpretCheckResult(check);

          if (newStatus !== "pending") {
            await db.user.update({
              where: { id: user.id },
              data: { kycStatus: newStatus },
            });
            return NextResponse.json({ kycStatus: newStatus });
          }
        } catch {
          // Onfido unavailable, return cached status
        }
      }

      return NextResponse.json({ kycStatus: fullUser.kycStatus });
    } catch (dbError) {
      if (isDbError(dbError)) {
        console.warn("[kyc/status] DB unavailable, returning mock KYC status");
        return NextResponse.json({
          kycStatus: DEV_USER.kycStatus,
          devMode: true,
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[kyc/status]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT /api/kyc — submit check (called after Onfido SDK completes)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { applicantId, documentIds } = await request.json();

    try {
      // Create check
      const check = await createCheck({
        applicantId,
        reportNames: ["document", "facial_similarity_photo"],
        documentIds,
      });

      // Store check ID
      await db.user.update({
        where: { id: user.id },
        data: { onfidoCheckId: check.id },
      });

      return NextResponse.json({
        success: true,
        checkId: check.id,
        status: "pending",
      });
    } catch (dbOrOnfidoError) {
      if (isDbError(dbOrOnfidoError) || process.env.NODE_ENV !== "production") {
        console.warn("[kyc/submit] DB/Onfido unavailable, returning dev mock");
        return NextResponse.json({
          success: true,
          checkId: "dev_mock_check_" + Date.now(),
          status: "pending",
          devMode: true,
        });
      }
      throw dbOrOnfidoError;
    }
  } catch (error) {
    console.error("[kyc/submit]", error);
    return NextResponse.json({ error: "Erreur lors de la soumission KYC" }, { status: 500 });
  }
}
