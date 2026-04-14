import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(5).max(5000),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Dev: log to console. Production: forward to SendGrid/Postmark/Zendesk inbox.
  console.log("[support/contact]", parsed.data);

  // TODO: forward to support@tindacash.com inbox and persist in DB

  return NextResponse.json({ ok: true });
}
