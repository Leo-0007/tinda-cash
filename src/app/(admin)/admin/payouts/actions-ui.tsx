"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

export function PayoutActions({ txId, currentStatus }: { txId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  async function update(newStatus: string) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/payouts/${txId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error(await res.text());
        setStatus(newStatus);
        toast.success(`Transfert ${newStatus}`);
      } catch (e: any) {
        toast.error(e.message || "Erreur");
      }
    });
  }

  if (status === "completed" || status === "failed") {
    return <span className="text-xs text-zinc-500">—</span>;
  }

  return (
    <div className="flex gap-2 justify-end">
      {status !== "awaiting_manual_processing" && (
        <button
          disabled={isPending}
          onClick={() => update("awaiting_manual_processing")}
          className="px-2 py-1 text-xs rounded border border-amber-500/50 text-amber-300 hover:bg-amber-500/10 disabled:opacity-50"
        >
          Prendre
        </button>
      )}
      <button
        disabled={isPending}
        onClick={() => update("completed")}
        className="px-2 py-1 text-xs rounded border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
      >
        ✓ Envoyé
      </button>
      <button
        disabled={isPending}
        onClick={() => update("failed")}
        className="px-2 py-1 text-xs rounded border border-red-500/50 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
      >
        ✗ Échec
      </button>
    </div>
  );
}
