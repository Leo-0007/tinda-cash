"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, HelpCircle, ChevronDown, Send } from "lucide-react";
import { toast } from "sonner";

const HELP_FAQ = [
  {
    q: "Combien de temps prend un transfert ?",
    a: "Les transferts mobile money arrivent généralement en 5 à 15 minutes. Les virements bancaires peuvent prendre jusqu'à 24 heures selon l'opérateur local. Durant notre phase pilote, chaque transfert est vérifié manuellement.",
  },
  {
    q: "Pourquoi dois-je vérifier mon identité ?",
    a: "La vérification KYC est obligatoire au-delà de 150€ par transaction, conformément à la directive européenne AMLD. Cela protège votre compte et lutte contre la fraude et le blanchiment d'argent.",
  },
  {
    q: "Comment puis-je annuler un transfert ?",
    a: "Vous pouvez annuler un transfert tant qu'il est en statut « En attente de paiement ». Contactez-nous immédiatement à support@tindacash.com avec votre référence de transaction pour toute annulation après paiement.",
  },
  {
    q: "Quels sont les moyens de paiement acceptés ?",
    a: "Nous acceptons les cartes Visa et Mastercard via Stripe (3D Secure activé). Apple Pay et Google Pay sont également disponibles. Les virements SEPA et open banking seront ajoutés en phase 2.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Toutes les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). Nous ne stockons jamais vos données de carte bancaire — elles sont traitées directement par Stripe (certifié PCI-DSS niveau 1).",
  },
  {
    q: "Que faire si mon bénéficiaire n'a pas reçu l'argent ?",
    a: "Vérifiez d'abord le statut dans votre historique. Si le transfert est marqué « Livré » mais que votre bénéficiaire ne voit rien, contactez-nous avec la référence — nous enquêtons immédiatement avec notre partenaire local.",
  },
  {
    q: "Quels pays puis-je utiliser pour recevoir ?",
    a: "Actuellement : Congo RDC, Congo-Brazzaville, Angola. D'autres corridors (Cameroun, Côte d'Ivoire, Sénégal) seront ajoutés progressivement.",
  },
  {
    q: "Comment fonctionne le programme de parrainage ?",
    a: "Le programme de parrainage sera activé prochainement. Vous recevrez un code unique à partager, et vous et votre filleul bénéficierez d'un bonus sur votre premier transfert.",
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      toast.success("Message envoyé. Nous répondons sous 24h.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast.error(err?.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <HelpCircle size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Centre d&apos;aide</h1>
            <p className="text-sm text-white/50">Nous sommes là pour vous aider.</p>
          </div>
        </div>
      </header>

      {/* Contact shortcuts */}
      <div className="grid sm:grid-cols-2 gap-3">
        <a
          href="mailto:support@tindacash.com"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
        >
          <Mail size={18} className="text-cyan-400" />
          <div>
            <div className="text-sm font-semibold text-white">Email</div>
            <div className="text-xs text-white/50">support@tindacash.com</div>
          </div>
        </a>
        <a
          href="https://wa.me/33600000000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
        >
          <MessageCircle size={18} className="text-emerald-400" />
          <div>
            <div className="text-sm font-semibold text-white">WhatsApp</div>
            <div className="text-xs text-white/50">Réponse sous 1h en semaine</div>
          </div>
        </a>
      </div>

      {/* FAQ */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Questions fréquentes</h2>
        <div className="space-y-2">
          {HELP_FAQ.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left"
              >
                <span className="text-sm font-medium text-white">{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-white/40 transition-transform shrink-0 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-4 pb-4 text-sm text-white/60 leading-relaxed border-t border-white/[0.06] pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Nous contacter</h2>
        <p className="text-sm text-white/50 mb-5">
          Votre question ne figure pas dans la FAQ ? Écrivez-nous.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom"
              className="rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-3 text-white placeholder:text-white/30 outline-none focus:border-cyan-500/40"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-3 text-white placeholder:text-white/30 outline-none focus:border-cyan-500/40"
            />
          </div>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Sujet"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-3 text-white placeholder:text-white/30 outline-none focus:border-cyan-500/40"
          />
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Votre message…"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-3 text-white placeholder:text-white/30 outline-none focus:border-cyan-500/40 resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? "Envoi..." : "Envoyer le message"}
          </button>
        </form>
      </section>

      <p className="text-xs text-white/30 text-center">
        Consultez aussi nos{" "}
        <Link href="/terms" className="underline hover:text-white">conditions générales</Link>,{" "}
        <Link href="/privacy" className="underline hover:text-white">politique de confidentialité</Link>{" "}
        et{" "}
        <Link href="/complaints" className="underline hover:text-white">procédure de réclamation</Link>.
      </p>
    </div>
  );
}
