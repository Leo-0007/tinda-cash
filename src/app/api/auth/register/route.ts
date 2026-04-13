import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  hashPassword,
  signToken,
  setSession,
  generateOtp,
  otpExpiresAt,
  DEV_USER,
  isDbError,
} from "@/lib/auth";

// ─────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────

const RegisterSchema = z.object({
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(50).trim(),
  phone: z.string().min(8).max(20).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
  country: z.string().min(2).max(50).trim(),
  referralCode: z.string().max(20).optional(),
});

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, email, password, country, referralCode } =
      parsed.data;

    try {
      // Check uniqueness
      const [existingEmail, existingPhone] = await Promise.all([
        db.user.findUnique({ where: { email } }),
        db.user.findUnique({ where: { phone } }),
      ]);

      if (existingEmail) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé" },
          { status: 409 }
        );
      }

      if (existingPhone) {
        return NextResponse.json(
          { error: "Ce numéro est déjà utilisé" },
          { status: 409 }
        );
      }

      // Find referrer if code provided
      let referrerId: string | undefined;
      if (referralCode) {
        const referrer = await db.user.findUnique({
          where: { referralCode },
          select: { id: true },
        });
        referrerId = referrer?.id;
      }

      const hashedPassword = await hashPassword(password);
      const userReferralCode = generateReferralCode(firstName, lastName);

      // Create user + wallets in transaction
      const user = await db.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            country,
            referralCode: userReferralCode,
          },
        });

        // Create multi-currency wallets
        await tx.wallet.createMany({
          data: [
            { userId: newUser.id, currency: "EUR", balance: 0 },
            { userId: newUser.id, currency: "USD", balance: 0 },
            { userId: newUser.id, currency: "CHF", balance: 0 },
          ],
        });

        // Handle referral
        if (referrerId) {
          await tx.referral.create({
            data: {
              referrerId,
              referredId: newUser.id,
              status: "pending",
            },
          });
        }

        return newUser;
      });

      // Generate and store OTP
      const otp = generateOtp();
      const expiresAt = otpExpiresAt(10);

      await db.otpCode.create({
        data: {
          userId: user.id,
          code: otp,
          type: "phone_verification",
          expiresAt,
        },
      });

      // Send OTP via SMS (Twilio)
      await sendOtpSms(phone, otp);

      // Create session
      const session = await db.session.create({
        data: {
          userId: user.id,
          token: "pending_verification",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          userAgent: request.headers.get("user-agent") || "",
          ipAddress: getClientIp(request),
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

      const response = NextResponse.json(
        {
          success: true,
          message: "Code OTP envoyé par SMS",
          userId: user.id,
          requiresOtp: true,
        },
        { status: 201 }
      );

      await setSession(token);
      return response;
    } catch (dbError) {
      if (isDbError(dbError)) {
        console.warn("[register] DB unavailable, creating dev session");

        // Create a mock session for dev
        const mockUserId = DEV_USER.id;
        const mockSessionId = "dev-session-" + Date.now();
        const token = await signToken({
          userId: mockUserId,
          sessionId: mockSessionId,
        });

        const otp = generateOtp();
        if (process.env.NODE_ENV !== "production") { console.log(`[DEV] Mock OTP for ${phone}: ${otp}`); }

        const response = NextResponse.json(
          {
            success: true,
            message: "[DEV] Inscription mock — OTP en console",
            userId: mockUserId,
            requiresOtp: true,
            devMode: true,
          },
          { status: 201 }
        );

        await setSession(token);
        return response;
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json(
      { error: "Erreur serveur. Réessayez." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function generateReferralCode(firstName: string, lastName: string): string {
  const base = (firstName.slice(0, 2) + lastName.slice(0, 2)).toUpperCase();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function sendOtpSms(phone: string, otp: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    // Dev mode — log OTP
    if (process.env.NODE_ENV !== "production") { console.log(`[DEV] OTP for ${phone}: ${otp}`); }
    return;
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: phone,
        Body: `Votre code Tinda Cash : ${otp}. Valide 10 minutes. Ne le communiquez à personne.`,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    console.error("[Twilio SMS error]", err);
    // Don't throw — OTP can be resent
  }
}
