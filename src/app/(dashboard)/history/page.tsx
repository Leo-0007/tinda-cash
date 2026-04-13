"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatCurrency, formatAmount, timeAgo } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/i18n";
import type {
  ApiTransaction,
  PaginationInfo,
  TransactionsListResponse,
} from "@/lib/types";
import {
  getFlagForCountry,
  AFRICAN_COUNTRIES,
  EUROPEAN_COUNTRIES,
} from "@/lib/corridors";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type TxStatus = "completed" | "pending" | "processing" | "failed" | "cancelled";
type TxDirection = "send" | "receive";

interface Transaction {
  id: string;
  ref: string;
  createdAt: Date;
  status: TxStatus;
  direction: TxDirection;
  fromCountry: string;
  fromFlag: string;
  fromCurrency: string;
  fromAmount: number;
  toCountry: string;
  toFlag: string;
  toCurrency: string;
  toAmount: number;
  beneficiary: string;
  method: string;
  fee: number;
  rate: number;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const ALL_COUNTRIES = [...AFRICAN_COUNTRIES, ...EUROPEAN_COUNTRIES];

function getCountryName(code: string): string {
  return ALL_COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

/** Map an API transaction to the page's Transaction interface */
function mapApiTransaction(tx: ApiTransaction): Transaction {
  const validStatuses: TxStatus[] = [
    "completed",
    "pending",
    "processing",
    "failed",
    "cancelled",
  ];
  const rawStatus = tx.status.toLowerCase() as TxStatus;
  const status: TxStatus = validStatuses.includes(rawStatus)
    ? rawStatus
    : "pending";

  return {
    id: tx.id,
    ref: tx.ref,
    createdAt: new Date(tx.createdAt),
    status,
    direction: "send",
    fromCountry: getCountryName(tx.fromCountry),
    fromFlag: getFlagForCountry(tx.fromCountry),
    fromCurrency: tx.fromCurrency,
    fromAmount: tx.fromAmount,
    toCountry: getCountryName(tx.toCountry),
    toFlag: getFlagForCountry(tx.toCountry),
    toCurrency: tx.toCurrency,
    toAmount: tx.toAmount,
    beneficiary: tx.beneficiary?.name ?? "Inconnu",
    method: tx.paymentMethod,
    fee: tx.fee,
    rate: tx.rate,
  };
}

// ─────────────────────────────────────────────
// Dev fallback mock data
// ─────────────────────────────────────────────

const DEV_FALLBACK: TransactionsListResponse = {
  transactions: [
    {
      id: "dev-1",
      ref: "TND-2024-0001",
      fromCurrency: "EUR",
      fromAmount: 200,
      fromCountry: "FR",
      toCurrency: "USD",
      toAmount: 216,
      toCountry: "CD",
      rate: 1.08,
      fee: 2.99,
      status: "completed",
      paymentMethod: "M-Pesa",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      beneficiary: { id: "b1", name: "Marie K.", type: "mobile_money", country: "CD" },
    },
    {
      id: "dev-2",
      ref: "TND-2024-0002",
      fromCurrency: "EUR",
      fromAmount: 100,
      fromCountry: "BE",
      toCurrency: "CDF",
      toAmount: 285000,
      toCountry: "CD",
      rate: 2850,
      fee: 1.99,
      status: "processing",
      paymentMethod: "Orange Money",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      beneficiary: { id: "b2", name: "Patrick M.", type: "mobile_money", country: "CD" },
    },
    {
      id: "dev-3",
      ref: "TND-2024-0003",
      fromCurrency: "EUR",
      fromAmount: 150,
      fromCountry: "FR",
      toCurrency: "XAF",
      toAmount: 98394,
      toCountry: "CG",
      rate: 655.96,
      fee: 2.49,
      status: "completed",
      paymentMethod: "Airtel Money",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 300000).toISOString(),
      beneficiary: { id: "b3", name: "Serge N.", type: "mobile_money", country: "CG" },
    },
    {
      id: "dev-4",
      ref: "TND-2024-0004",
      fromCurrency: "CHF",
      fromAmount: 300,
      fromCountry: "CH",
      toCurrency: "USD",
      toAmount: 336,
      toCountry: "CD",
      rate: 1.12,
      fee: 3.99,
      status: "failed",
      paymentMethod: "M-Pesa",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      beneficiary: { id: "b4", name: "Grace L.", type: "mobile_money", country: "CD" },
    },
    {
      id: "dev-5",
      ref: "TND-2024-0005",
      fromCurrency: "EUR",
      fromAmount: 500,
      fromCountry: "PT",
      toCurrency: "AOA",
      toAmount: 490000,
      toCountry: "AO",
      rate: 980,
      fee: 4.99,
      status: "completed",
      paymentMethod: "Multicaixa Express",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 180000).toISOString(),
      beneficiary: { id: "b5", name: "Paulo M.", type: "mobile_money", country: "AO" },
    },
    {
      id: "dev-6",
      ref: "TND-2024-0006",
      fromCurrency: "GBP",
      fromAmount: 250,
      fromCountry: "GB",
      toCurrency: "USD",
      toAmount: 315,
      toCountry: "CD",
      rate: 1.26,
      fee: 3.49,
      status: "completed",
      paymentMethod: "Airtel Money",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 240000).toISOString(),
      beneficiary: { id: "b6", name: "Fiston B.", type: "mobile_money", country: "CD" },
    },
    {
      id: "dev-7",
      ref: "TND-2024-0007",
      fromCurrency: "EUR",
      fromAmount: 75,
      fromCountry: "FR",
      toCurrency: "AOA",
      toAmount: 73500,
      toCountry: "AO",
      rate: 980,
      fee: 1.49,
      status: "cancelled",
      paymentMethod: "Unitel Money",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      beneficiary: { id: "b7", name: "Ana S.", type: "mobile_money", country: "AO" },
    },
    {
      id: "dev-8",
      ref: "TND-2024-0008",
      fromCurrency: "CAD",
      fromAmount: 400,
      fromCountry: "CA",
      toCurrency: "USD",
      toAmount: 296,
      toCountry: "CD",
      rate: 0.74,
      fee: 4.49,
      status: "completed",
      paymentMethod: "M-Pesa",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 120000).toISOString(),
      beneficiary: { id: "b8", name: "Jean-Claude T.", type: "mobile_money", country: "CD" },
    },
  ],
  pagination: {
    total: 8,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

// ─────────────────────────────────────────────
// Status config (static parts — labels resolved at render time via t())
// ─────────────────────────────────────────────

const STATUS_ICON_CONFIG: Record<
  TxStatus,
  { badgeCls: string; icon: typeof CheckCircle2 }
> = {
  completed: { badgeCls: "badge-ok", icon: CheckCircle2 },
  processing: { badgeCls: "badge-blue", icon: Loader2 },
  pending: { badgeCls: "badge-warn", icon: Clock },
  failed: { badgeCls: "badge-bad", icon: XCircle },
  cancelled: { badgeCls: "badge-muted", icon: AlertCircle },
};

function getStatusLabel(status: TxStatus, t: (key: string) => string): string {
  const map: Record<TxStatus, string> = {
    completed: t("status.completed"),
    processing: t("status.processing"),
    pending: t("status.pending"),
    failed: t("status.failed"),
    cancelled: t("status.cancelled"),
  };
  return map[status];
}

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────

function StatusBadge({ status }: { status: TxStatus }) {
  const t = useT();
  const cfg = STATUS_ICON_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cfg.badgeCls}>
      <Icon
        className={`w-3 h-3 ${status === "processing" ? "animate-spin" : ""}`}
      />
      {getStatusLabel(status, t)}
    </span>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="skeleton-blue w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="skeleton-blue h-4 w-32 rounded" />
        <div className="skeleton-blue h-3 w-48 rounded" />
      </div>
      <div className="text-right space-y-2 flex-shrink-0">
        <div className="skeleton-blue h-4 w-20 rounded ml-auto" />
        <div className="skeleton-blue h-3 w-16 rounded ml-auto" />
      </div>
    </div>
  );
}

function SkeletonSummary() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-20 rounded" />
      <div className="skeleton h-6 w-28 rounded" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Transaction Detail Modal
// ─────────────────────────────────────────────

function TransactionModal({
  tx,
  onClose,
}: {
  tx: Transaction;
  onClose: () => void;
}) {
  const t = useT();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border-light)" }} />
        </div>

        {/* Header */}
        <div className="p-6 pb-4" style={{ borderBottom: `1px solid var(--border-light)` }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {tx.ref}
            </span>
            <StatusBadge status={tx.status} />
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {timeAgo(tx.createdAt)}
          </p>
        </div>

        {/* Amount display */}
        <div
          className="p-6"
          style={{
            borderBottom: `1px solid var(--border-light)`,
            background: "var(--bg-card-alt)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                {t("history.sent")}
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {tx.fromFlag} {formatAmount(tx.fromAmount)}{" "}
                <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
                  {tx.fromCurrency}
                </span>
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
            <div className="text-right">
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                {t("history.received")}
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--ok)" }}>
                {tx.toFlag} {formatCurrency(tx.toAmount, tx.toCurrency)}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-3">
          {[
            { label: t("history.beneficiary"), value: tx.beneficiary },
            { label: t("history.method"), value: tx.method },
            {
              label: t("history.fees"),
              value: `${formatAmount(tx.fee)} ${tx.fromCurrency}`,
            },
            {
              label: t("history.rate_applied"),
              value: `1 ${tx.fromCurrency} = ${formatAmount(tx.rate)} ${tx.toCurrency}`,
            },
            { label: t("history.from"), value: `${tx.fromFlag} ${tx.fromCountry}` },
            { label: t("history.to"), value: `${tx.toFlag} ${tx.toCountry}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          {tx.status === "failed" || tx.status === "cancelled" ? (
            <button className="flex-1 btn-primary text-sm py-2.5">
              {t("common.retry")}
            </button>
          ) : null}
          <button
            onClick={onClose}
            className={`${tx.status === "failed" || tx.status === "cancelled" ? "flex-1" : "w-full"} btn-secondary text-sm py-2.5`}
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Summary Cards
// ─────────────────────────────────────────────

function SummaryCards({
  transactions,
  loading,
}: {
  transactions: Transaction[];
  loading: boolean;
}) {
  const t = useT();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4">
        <SkeletonSummary />
        <SkeletonSummary />
        <SkeletonSummary />
      </div>
    );
  }

  const completed = transactions.filter((tx) => tx.status === "completed");
  const totalSent = completed.reduce((sum, tx) => sum + tx.toAmount, 0);
  const totalFees = completed.reduce(
    (sum, tx) => (tx.rate > 0 ? sum + tx.fee / tx.rate : sum),
    0
  );
  const avgSaving = 4.2;

  const stats = [
    {
      label: t("history.total_sent"),
      value: formatCurrency(totalSent, "EUR"),
      subvalue: `${completed.length} transfert${completed.length > 1 ? "s" : ""}`,
      icon: TrendingUp,
      iconColor: "var(--ok)",
      iconBg: "var(--ok-bg)",
    },
    {
      label: t("history.fees_paid"),
      value: formatCurrency(totalFees, "EUR"),
      subvalue: `vs ~${formatCurrency(totalFees * (1 + avgSaving / 100), "EUR")} ${t("history.elsewhere")}`,
      icon: Receipt,
      iconColor: "var(--blue-500)",
      iconBg: "rgba(37,99,235,0.10)",
    },
    {
      label: t("history.savings"),
      value: formatCurrency(totalFees * (avgSaving / 100), "EUR"),
      subvalue: `${avgSaving}% ${t("history.cheaper")}`,
      icon: TrendingDown,
      iconColor: "var(--warn)",
      iconBg: "var(--warn-bg)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="card p-4">
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-xl flex-shrink-0"
                style={{ background: stat.iconBg }}
              >
                <Icon className="w-4 h-4" style={{ color: stat.iconColor }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {stat.label}
                </p>
                <p
                  className="text-lg font-bold mt-0.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {stat.subvalue}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const t = useT();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("30");
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // API state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic filter options with i18n
  const STATUSES = useMemo(() => [
    { value: "all", label: t("history.filter.all") },
    { value: "completed", label: t("history.filter.completed") },
    { value: "processing", label: t("history.filter.processing") },
    { value: "pending", label: t("history.filter.pending") },
    { value: "failed", label: t("history.filter.failed") },
  ], [t]);

  const PERIODS = useMemo(() => [
    { value: "7", label: "7j" },
    { value: "30", label: "30j" },
    { value: "90", label: "90j" },
    { value: "all", label: t("history.filter.all") },
  ], [t]);

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (periodFilter !== "all") {
        params.set("period", periodFilter);
      }

      const data = await apiFetch<TransactionsListResponse>(
        `/api/transfers?${params.toString()}`,
        { devFallback: DEV_FALLBACK }
      );

      setTransactions(data.transactions.map(mapApiTransaction));
      setPagination(data.pagination);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du chargement";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, periodFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, periodFilter]);

  // Client-side search filtering within fetched page for instant UX
  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;

    const q = search.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.ref.toLowerCase().includes(q) ||
        tx.beneficiary.toLowerCase().includes(q) ||
        tx.fromCountry.toLowerCase().includes(q) ||
        tx.toCountry.toLowerCase().includes(q) ||
        tx.fromCurrency.toLowerCase().includes(q) ||
        tx.toCurrency.toLowerCase().includes(q)
    );
  }, [search, transactions]);

  // Use server-side pagination
  const totalPages = Math.max(1, pagination.totalPages);

  // Group by date for display
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => {
      const d = tx.createdAt;
      const now = new Date();
      let label: string;
      if (d.toDateString() === now.toDateString()) {
        label = t("history.today");
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) {
          label = t("history.yesterday");
        } else {
          label = d.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          });
          label = label.charAt(0).toUpperCase() + label.slice(1);
        }
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    });
    return groups;
  }, [filtered, t]);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("history.title")}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-on-blue-muted)" }}>
            {loading
              ? t("history.loading")
              : `${pagination.total} transaction${pagination.total > 1 ? "s" : ""}`}
          </p>
        </div>
        <button className="btn-white text-xs py-2 px-3 gap-1.5">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{t("history.export")}</span>
        </button>
      </div>

      {/* Summary */}
      <SummaryCards transactions={transactions} loading={loading} />

      {/* Filter pills -- status */}
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scroll-row">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
              style={{
                background:
                  statusFilter === s.value
                    ? "var(--gradient-cyan)"
                    : "rgba(255,255,255,0.08)",
                color:
                  statusFilter === s.value
                    ? "#030F0D"
                    : "rgba(255,255,255,0.6)",
                border: statusFilter === s.value
                  ? "none"
                  : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Period pills */}
      <div className="px-4">
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodFilter(p.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background:
                  periodFilter === p.value
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
                color:
                  periodFilter === p.value
                    ? "white"
                    : "rgba(255,255,255,0.4)",
                border:
                  periodFilter === p.value
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "1px solid transparent",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search on blue */}
      <div className="px-4">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "rgba(255,255,255,0.4)" }}
          />
          <input
            type="text"
            placeholder={t("history.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-on-blue pl-10 w-full text-sm"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mx-4 card text-center py-8">
          <XCircle className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--bad)" }} />
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {error}
          </p>
          <button
            onClick={fetchTransactions}
            className="btn-secondary text-sm mt-4"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="mx-4 space-y-4">
          <div className="skeleton-blue h-3 w-24 rounded mb-2" />
          <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
          <div className="skeleton-blue h-3 w-32 rounded mb-2" />
          <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </div>
      )}

      {/* Transaction list */}
      {!loading && !error && filtered.length === 0 ? (
        <div className="mx-4 card text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--bg-input)" }}
          >
            <Receipt className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("history.no_results")}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {search
              ? t("history.no_results_search")
              : t("history.no_results_hint")}
          </p>
        </div>
      ) : null}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-5 px-4">
          {Object.entries(grouped).map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-on-blue-muted)" }}
              >
                {dateLabel}
              </h3>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="w-full card p-4 flex items-center gap-3 text-left group transition-all hover:shadow-lg"
                  >
                    {/* Avatar */}
                    <div className="avatar-sm text-xs flex-shrink-0">
                      {tx.beneficiary
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {tx.beneficiary}
                        </span>
                        <span className="hidden sm:block">
                          <StatusBadge status={tx.status} />
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span>
                          {tx.fromFlag} {tx.fromCountry}
                        </span>
                        <span>{"\u2192"}</span>
                        <span>
                          {tx.toFlag} {tx.toCountry}
                        </span>
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        -{formatAmount(tx.fromAmount)}{" "}
                        <span
                          className="font-normal text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {tx.fromCurrency}
                        </span>
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--ok)" }}>
                        +{formatCurrency(tx.toAmount, tx.toCurrency)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost p-2 disabled:opacity-40"
                style={{ color: "white" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background:
                      p === page
                        ? "var(--gradient-cyan)"
                        : "rgba(255,255,255,0.08)",
                    color: p === page ? "#030F0D" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost p-2 disabled:opacity-40"
                style={{ color: "white" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedTx && (
        <TransactionModal
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
}
