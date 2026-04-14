import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { hashPassword, isDbError } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars"
);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { token, password } = parsed.data;

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.purpose !== "reset" || !payload.userId) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }
    userId = payload.userId as string;
  } catch {
    return NextResponse.json({ error: "token_expired_or_invalid" }, { status: 400 });
  }

  try {
    const hashed = await hashPassword(password);
    await db.user.update({ where: { id: userId }, data: { password: hashed } });
    // Invalidate all existing sessions
    await db.session.deleteMany({ where: { userId } }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isDbError(e)) {
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    console.error("[auth/reset]", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
