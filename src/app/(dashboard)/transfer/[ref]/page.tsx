import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Clock, AlertCircle, ArrowLeft, Download, Share2 } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser, isDbError } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function loadTransfer(ref: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const tx = await db.transaction.findFirst({
      where: { ref, userId: user.id },
      include: { beneficiary: true },
    });
    return tx;
  } catch (e) {
    if (isDbError(e)) {
      // Dev fallback mock
      return {
        id: "dev-" + ref,
        ref,
        status: "awaiting_manual_processing",
        fromCurrency: "EUR",
        toCurrency: "USD",
        fromAmount: 100,
        toAmount: 108,
        fee: 0.99,
        rate: 1.08,
        fromCountry: "FR",
        toCountry: "CD",
        paymentMethod: "card",
        createdAt: new Date(),
        completedAt: null,
        beneficiary: { name: "—", phone: "—", country: "CD" },
      } as any;
    }
    throw e;
  }
}

const STATUS_META: Record<string, { label: string; desc: string; color: string; Icon: any }> = {
  pending: {
    label: "En attente de paiement",
    desc: "Complétez le paiement pour démarrer le transfert.",
    color: "amber",
    Icon: Clock,
  },
  awaiting_manual_processing: {
    label: "Paiement reçu",
    desc: "Nous exécutons votre transfert. Livraison estimée sous 15 minutes.",
    color: "indigo",
    Icon: Clock,
  },
  processing: {
    label: "En cours d'exécution",
    desc: "Transfert en route vers le bénéficiaire.",
    color: "indigo",
    Icon: Clock,
  },
  completed: {
    label: "Livré",
    desc: "Votre bénéficiaire a reçu les fonds.",
    color: "emerald",
    Icon: Check,
  },
  failed: {
    label: "Échec",
    desc: "Le transfert n'a pas pu être complété. Contactez le support.",
    color: "red",
    Icon: AlertCircle,
  },
  cancelled: {
    label: "Annulé",
    desc: "Ce transfert a été annulé.",
    color: "zinc",
    Icon: AlertCircle,
  },
};

export default async function TransferReceiptPage({ params }: { params: { ref: string } }) {
  const tx = await loadTransfer(params.ref);
  if (!tx) notFound();

  const meta = STATUS_META[tx.status] ?? STATUS_META.pending;
  const Icon = meta.Icon;

  const colorClass: Record<string, string> = {
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    red: "text-red-400 bg-red-500/10 border-red-500/30",
    zinc: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
  };

  const total = Number(tx.fromAmount) + Number(tx.fee);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/history"
          className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">Reçu de transfert</h1>
          <p className="text-xs text-white/40 font-mono">{tx.ref}</p>
        </div>
      </div>

      {/* Status card */}
      <div className={`rounded-2xl border p-5 ${colorClass[meta.color]}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{meta.label}</div>
            <p className="text-xs opacity-80 mt-0.5">{meta.desc}</p>
          </div>
        </div>
      </div>

      {/* Amounts */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-4">
        <div className="text-center pb-4 border-b border-white/[0.06]">
          <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Montant envoyé</div>
          <div className="text-3xl font-bold text-white">
            {Number(tx.fromAmount).toFixed(2)} {tx.fromCurrency}
          </div>
          <div className="text-xs text-white/40 mt-2">Le bénéficiaire reçoit</div>
          <div className="text-xl font-semibold text-emerald-400 mt-1">
            {Number(tx.toAmount).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {tx.toCurrency}
          </div>
        </div>

        <Row label="Bénéficiaire" value={tx.beneficiary?.name || "—"} />
        <Row label="Pays destination" value={tx.toCountry} />
        <Row label="Taux appliqué" value={`1 ${tx.fromCurrency} = ${Number(tx.rate).toFixed(4)} ${tx.toCurrency}`} />
        <Row label="Frais" value={`${Number(tx.fee).toFixed(2)} ${tx.fromCurrency}`} />
        <div className="pt-3 border-t border-white/[0.06]">
          <Row label={<span className="text-white font-semibold">Total payé</span>} value={
            <span className="text-white font-bold">{total.toFixed(2)} {tx.fromCurrency}</span>
          } />
        </div>
        <Row label="Créé le" value={new Date(tx.createdAt).toLocaleString("fr-FR")} />
        {tx.completedAt && <Row label="Livré le" value={new Date(tx.completedAt).toLocaleString("fr-FR")} />}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => typeof window !== "undefined" && window.print()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] text-sm font-medium"
        >
          <Download size={16} /> Imprimer
        </button>
        <Link
          href="/help"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] text-sm font-medium"
        >
          <Share2 size={16} /> Besoin d'aide ?
        </Link>
      </div>

      <p className="text-[11px] text-white/30 text-center leading-relaxed pt-4">
        Tinda Cash opère en phase pilote. Chaque transfert est vérifié manuellement avant exécution.
        En cas de question, consultez notre <Link href="/help" className="underline">page d&apos;aide</Link>.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  );
}
