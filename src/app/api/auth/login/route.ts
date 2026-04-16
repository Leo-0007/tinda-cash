import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  verifyPassword,
  signToken,
  setSession,
  generateOtp,
  otpExpiresAt,
  DEV_USER,
  isDbError,
} from "@/lib/auth";

const LoginSchema = z.object({
  phone: z.string().min(8).max(20).trim(),
  password: z.string().min(8),
});

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    const { phone, password } = parsed.data;

    try {
      const user = await db.user.findUnique({
        where: { phone },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          password: true,
          kycStatus: true,
          phoneVerified: true,
          isActive: true,
        },
      });

      // Generic error message to prevent user enumeration
      const invalidCredentials = NextResponse.json(
        { error: "Numéro ou mot de passe incorrect" },
        { status: 401 }
      );

      if (!user || !user.password) return invalidCredentials;
      if (!user.isActive) {
        return NextResponse.json(
          { error: "Compte désactivé. Contactez le support." },
          { status: 403 }
        );
      }

      const passwordValid = await verifyPassword(password, user.password);
      if (!passwordValid) return invalidCredentials;

      // If phone not verified, trigger OTP flow
      if (!user.phoneVerified) {
        const otp = generateOtp();
        await db.otpCode.create({
          data: {
            userId: user.id,
            code: otp,
            type: "phone_verification",
            expiresAt: otpExpiresAt(10),
          },
        });
        if (process.env.NODE_ENV !== "production") { console.log(`[DEV] OTP for ${phone}: ${otp}`); }

        return NextResponse.json(
          {
            requiresOtp: true,
            userId: user.id,
            message: "Code OTP envoyé",
          },
          { status: 200 }
        );
      }

      // Create session
      const session = await db.session.create({
        data: {
          userId: user.id,
          token: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          userAgent: request.headers.get("user-agent") || "",
          ipAddress:
            request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        },
      });

      const token = await signToken({
        userId: user.id,
        sessionId: session.id,
      });

      await db.session.update({
        where: { id: session.id },
        data: { token },
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          kycStatus: user.kycStatus,
        },
      });

      await setSession(token);
      return response;
    } catch (dbError) {
      if (isDbError(dbError)) {
        console.warn("[login] DB unavailable, checking dev credentials");

        // Accept test credentials when DB is down (development only)
        if (process.env.NODE_ENV !== "production" && phone === DEV_USER.phone && password === "Test1234") {
          const mockSessionId = "dev-session-" + Date.now();
          const token = await signToken({
            userId: DEV_USER.id,
            sessionId: mockSessionId,
          });

          const response = NextResponse.json({
            success: true,
            user: {
              id: DEV_USER.id,
              firstName: DEV_USER.firstName,
              lastName: DEV_USER.lastName,
              kycStatus: DEV_USER.kycStatus,
            },
            devMode: true,
          });

          await setSession(token);
          return response;
        }

        return NextResponse.json(
          { error: "Numéro ou mot de passe incorrect" },
          { status: 401 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[login]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
