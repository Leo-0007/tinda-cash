"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");
      toast.success("Mot de passe mis à jour");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.message || "Lien invalide ou expiré");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-center text-sm text-red-300">
        Lien invalide. Demandez un nouveau lien de réinitialisation.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2 block">
          Nouveau mot de passe
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-3">
          <Lock size={16} className="text-white/40" />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2 block">
          Confirmer
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-3">
          <Lock size={16} className="text-white/40" />
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? "Mise à jour..." : "Réinitialiser"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090B] px-5">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6">
          <ArrowLeft size={14} /> Retour à la connexion
        </Link>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h1 className="text-2xl font-bold text-white mb-1">Nouveau mot de passe</h1>
          <p className="text-sm text-white/50 mb-6">Choisissez un mot de passe sécurisé (8 caractères min).</p>
          <Suspense fallback={<div className="text-white/40 text-sm">Chargement…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
