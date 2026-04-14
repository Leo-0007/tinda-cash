"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Erreur");
      setSent(true);
      toast.success("Si un compte existe, un email a été envoyé.");
    } catch (err: any) {
      toast.error(err?.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090B] px-5">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6">
          <ArrowLeft size={14} /> Retour à la connexion
        </Link>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h1 className="text-2xl font-bold text-white mb-1">Mot de passe oublié</h1>
          <p className="text-sm text-white/50 mb-6">
            Entrez votre email et nous vous enverrons un lien de réinitialisation.
          </p>

          {sent ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 mx-auto flex items-center justify-center mb-3">
                <Check className="text-emerald-400" />
              </div>
              <p className="text-sm text-emerald-200">
                Si un compte correspond à cette adresse email, vous recevrez un lien de réinitialisation
                dans les prochaines minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2 block">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-3">
                  <Mail size={16} className="text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-white/25"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
