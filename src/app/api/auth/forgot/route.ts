import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SignJWT } from "jose";
import { db } from "@/lib/db";
import { isDbError } from "@/lib/auth";

const schema = z.object({ email: z.string().email() });
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars"
);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const { email } = parsed.data;

  try {
    const user = await db.user.findUnique({ where: { email } });

    // Always respond 200 to avoid email enumeration.
    if (user) {
      const token = await new SignJWT({ userId: user.id, purpose: "reset" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(SECRET);

      const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "";
      const resetUrl = `${origin}/reset-password?token=${token}`;

      // Production: send email via SendGrid/Postmark.
      // Dev: log to console so you can grab the link locally.
      if (process.env.NODE_ENV !== "production") {
        console.log(`[auth/forgot] reset link for ${email}: ${resetUrl}`);
      }
      // TODO: integrate email provider (SendGrid/Resend)
    }
  } catch (e) {
    if (!isDbError(e)) {
      console.error("[auth/forgot]", e);
    }
    // Silent on DB errors — still return 200
  }

  return NextResponse.json({ ok: true });
}
