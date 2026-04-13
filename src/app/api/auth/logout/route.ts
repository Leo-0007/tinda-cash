import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearSession, getSessionToken, verifyToken } from "@/lib/auth";

// POST /api/auth/logout
export async function POST(request: NextRequest) {
  try {
    const token = await getSessionToken();
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.sessionId) {
        // Invalidate session in DB (ignore errors if DB is down)
        await db.session.updateMany({
          where: {
            id: payload.sessionId,
            userId: payload.userId,
          },
          data: { expiresAt: new Date(0) },
        }).catch(() => {/* ignore — DB may be down */});
      }
    }

    await clearSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[logout]", error);
    // Always clear session even on error
    await clearSession().catch(() => {});
    return NextResponse.json({ success: true });
  }
}
