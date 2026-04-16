import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, setSession, isDbError } from "@/lib/auth";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string; // Google unique ID
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

/**
 * GET /api/auth/google/callback
 * Handles the OAuth2 callback from Google.
 * - Exchanges code for tokens
 * - Fetches user info
 * - Creates or updates user in DB
 * - Sets session cookie
 * - Redirects to /dashboard
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tinda-cash.vercel.app";

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=google_not_configured`);
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`;

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("[google/callback] Token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(`${appUrl}/login?error=google_token_failed`);
    }

    const tokens: GoogleTokenResponse = await tokenRes.json();

    // 2. Fetch user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      console.error("[google/callback] Userinfo failed:", await userRes.text());
      return NextResponse.redirect(`${appUrl}/login?error=google_userinfo_failed`);
    }

    const gUser: GoogleUserInfo = await userRes.json();

    // 3. Find or create user in DB
    let user: { id: string; firstName: string; lastName: string; kycStatus: string } | null = null;

    try {
      // Check if user exists by googleId or email
      const existing = await db.user.findFirst({
        where: {
          OR: [
            { googleId: gUser.sub },
            ...(gUser.email ? [{ email: gUser.email }] : []),
          ],
        },
        select: { id: true, firstName: true, lastName: true, kycStatus: true, googleId: true },
      });

      if (existing) {
        // Link Google account if not already linked
        if (!existing.googleId) {
          await db.user.update({
            where: { id: existing.id },
            data: {
              googleId: gUser.sub,
              avatarUrl: gUser.picture,
              emailVerified: gUser.email_verified,
            },
          });
        }
        user = existing;
      } else {
        // Create new user from Google profile
        const newUser = await db.user.create({
          data: {
            googleId: gUser.sub,
            email: gUser.email,
            emailVerified: gUser.email_verified,
            firstName: gUser.given_name || gUser.name?.split(" ")[0] || "User",
            lastName: gUser.family_name || gUser.name?.split(" ").slice(1).join(" ") || "",
            phone: "", // Google doesn't provide phone — user can add later
            country: "FR", // Default, user can change in profile
            avatarUrl: gUser.picture,
            phoneVerified: false,
            referralCode: `G${gUser.sub.slice(-6).toUpperCase()}`,
          },
          select: { id: true, firstName: true, lastName: true, kycStatus: true },
        });
        user = newUser;
      }

      // 4. Create session
      const session = await db.session.create({
        data: {
          userId: user.id,
          token: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          userAgent: req.headers.get("user-agent") || "",
          ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        },
      });

      const token = await signToken({ userId: user.id, sessionId: session.id });
      await db.session.update({ where: { id: session.id }, data: { token } });
      await setSession(token);
    } catch (dbErr) {
      if (isDbError(dbErr)) {
        console.error("[google/callback] DB error:", dbErr);
        return NextResponse.redirect(`${appUrl}/login?error=db_unavailable`);
      }
      throw dbErr;
    }

    // 5. Redirect to dashboard
    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (err) {
    console.error("[google/callback] Unexpected error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=google_unknown`);
  }
}
