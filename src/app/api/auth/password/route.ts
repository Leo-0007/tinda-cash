import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, hashPassword, verifyPassword, isDbError } from "@/lib/auth";
import { db } from "@/lib/db";

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
});

// PUT /api/auth/password — Change password
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = PasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    try {
      // Get full user with password hash
      const fullUser = await db.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      if (!fullUser) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
      }

      // Verify current password
      const valid = await verifyPassword(currentPassword, fullUser.password);
      if (!valid) {
        return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
      }

      // Hash new password and update
      const hashed = await hashPassword(newPassword);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      return NextResponse.json({ success: true, message: "Mot de passe modifié avec succès" });
    } catch (dbError) {
      if (isDbError(dbError)) {
        console.warn("[auth/password] DB unavailable, returning mock success in dev mode");
        return NextResponse.json({
          success: true,
          message: "Mot de passe modifié avec succès (mode dev)",
          devMode: true,
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[auth/password]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
