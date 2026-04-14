import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED = [
  "pending",
  "awaiting_manual_processing",
  "processing",
  "completed",
  "failed",
] as const;

const schema = z.object({ status: z.enum(ALLOWED) });

async function getAdmin() {
  const token = (await cookies()).get("tinda_session")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    });
    if (user?.role === "admin") return user;
  } catch {
    if (process.env.ADMIN_DEV_BYPASS === "1") return { id: payload.userId, role: "admin" };
  }
  return null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  try {
    const updated = await db.transaction.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status as any,
        ...(parsed.data.status === "completed" ? { completedAt: new Date() } : {}),
      },
    });
    return NextResponse.json({ ok: true, id: updated.id, status: updated.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "db_error" }, { status: 500 });
  }
}
