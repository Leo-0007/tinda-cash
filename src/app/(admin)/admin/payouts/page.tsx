import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { PayoutActions } from "./actions-ui";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const token = (await cookies()).get("tinda_session")?.value;
  if (!token) redirect("/login");
  const payload = await verifyToken(token);
  if (!payload) redirect("/login");

  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, email: true },
    });
    if (!user || user.role !== "admin") redirect("/dashboard");
    return user;
  } catch {
    // Dev fallback: if DB unavailable, allow only if explicit env flag
    if (process.env.ADMIN_DEV_BYPASS === "1") {
      return { id: payload.userId, role: "admin", email: "dev@tinda.local" };
    }
    redirect("/dashboard");
  }
}

export default async function AdminPayoutsPage() {
  const admin = await requireAdmin();

  let pending: any[] = [];
  try {
    pending = await db.transaction.findMany({
      where: {
        status: {
          in: ["pending", "awaiting_manual_processing", "processing"] as any,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        beneficiary: true,
      },
    });
  } catch (e) {
    // DB unavailable — empty list in dev
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b border-zinc-800 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Payouts manuels</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Mode concierge MVP — exécution manuelle via Yellow Card / Binance P2P.
              </p>
            </div>
            <span className="text-xs text-zinc-500">
              Connecté : <span className="text-indigo-400">{admin.email}</span>
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="En attente" value={pending.filter((p) => p.status === "pending").length} color="amber" />
          <StatCard
            label="À exécuter"
            value={pending.filter((p) => p.status === "awaiting_manual_processing").length}
            color="indigo"
          />
          <StatCard
            label="En cours"
            value={pending.filter((p) => p.status === "processing").length}
            color="emerald"
          />
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Ref</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Bénéficiaire</th>
                <th className="text-right px-4 py-3">Envoi</th>
                <th className="text-right px-4 py-3">Réception</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-zinc-500 py-12">
                    Aucun transfert en attente.
                  </td>
                </tr>
              )}
              {pending.map((tx) => (
                <tr key={tx.id} className="border-t border-zinc-800 hover:bg-zinc-900/40">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{tx.ref}</td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-100">{tx.user?.firstName} {tx.user?.lastName}</div>
                    <div className="text-zinc-500 text-xs">{tx.user?.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-100">{tx.beneficiary?.firstName} {tx.beneficiary?.lastName}</div>
                    <div className="text-zinc-500 text-xs">{tx.beneficiary?.phone} · {tx.beneficiary?.country}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-100">
                    {Number(tx.fromAmount).toFixed(2)} {tx.fromCurrency}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400">
                    {Number(tx.toAmount).toFixed(2)} {tx.toCurrency}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={tx.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PayoutActions txId={tx.id} currentStatus={tx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-zinc-600 mt-6 text-center">
          Tinda Cash — Admin panel · concierge mode · v1.0
        </p>
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    amber: "text-amber-400 border-amber-500/30 bg-amber-500/5",
    indigo: "text-indigo-400 border-indigo-500/30 bg-indigo-500/5",
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-zinc-700/50 text-zinc-300",
    awaiting_manual_processing: "bg-amber-500/20 text-amber-300",
    processing: "bg-indigo-500/20 text-indigo-300",
    completed: "bg-emerald-500/20 text-emerald-300",
    failed: "bg-red-500/20 text-red-300",
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs ${map[status] ?? "bg-zinc-700 text-zinc-300"}`}>
      {status}
    </span>
  );
}
