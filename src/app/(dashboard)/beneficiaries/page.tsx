"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Trash2,
  Star,
  UserPlus,
  Users,
  Phone,
  Building2,
  CreditCard,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, apiPost, apiDelete } from "@/lib/api";
import { getFlagForCountry, DESTINATION_COUNTRIES } from "@/lib/corridors";
import { maskIban, timeAgo } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { ApiBeneficiary, BeneficiariesListResponse } from "@/lib/types";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type BeneficiaryType = "iban" | "sort_code" | "mobile_money";

interface NewBeneficiaryForm {
  name: string;
  type: BeneficiaryType;
  country: string;
  currency: string;
  iban: string;
  sortCode: string;
  accountNumber: string;
  phone: string;
}

const INITIAL_FORM: NewBeneficiaryForm = {
  name: "",
  type: "mobile_money",
  country: "",
  currency: "",
  iban: "",
  sortCode: "",
  accountNumber: "",
  phone: "",
};

// ─────────────────────────────────────────────
// Mock data (dev fallback)
// ─────────────────────────────────────────────

const MOCK_BENEFICIARIES: ApiBeneficiary[] = [
  {
    id: "ben-1",
    name: "Marie Kabila",
    type: "mobile_money",
    currency: "USD",
    country: "CD",
    iban: null,
    phone: "+243812345678",
    sortCode: null,
    accountNumber: null,
    bankName: "M-Pesa",
    isFavorite: true,
    lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ben-2",
    name: "Jean-Pierre Ntumba",
    type: "mobile_money",
    currency: "CDF",
    country: "CD",
    iban: null,
    phone: "+243901234567",
    sortCode: null,
    accountNumber: null,
    bankName: "Orange Money",
    isFavorite: false,
    lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ben-3",
    name: "Paulo Santos",
    type: "mobile_money",
    currency: "AOA",
    country: "AO",
    iban: null,
    phone: "+244923456789",
    sortCode: null,
    accountNumber: null,
    bankName: "Multicaixa Express",
    isFavorite: true,
    lastUsedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ben-4",
    name: "David Mouanda",
    type: "mobile_money",
    currency: "XAF",
    country: "CG",
    iban: null,
    phone: "+242061234567",
    sortCode: null,
    accountNumber: null,
    bankName: "Airtel Money",
    isFavorite: false,
    lastUsedAt: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ben-5",
    name: "Ana Ferreira",
    type: "mobile_money",
    currency: "AOA",
    country: "AO",
    iban: null,
    phone: "+244912345678",
    sortCode: null,
    accountNumber: null,
    bankName: "Unitel Money",
    isFavorite: false,
    lastUsedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getCurrencyForCountry(code: string): string {
  return DESTINATION_COUNTRIES.find((c) => c.code === code)?.currency ?? "";
}

function getTypeBadge(type: string) {
  switch (type) {
    case "iban":
      return { label: "IBAN", icon: CreditCard, cls: "badge-cyan" };
    case "sort_code":
      return { label: "Sort Code", icon: Building2, cls: "badge-blue" };
    case "mobile_money":
      return { label: "Mobile", icon: Phone, cls: "badge-muted" };
    default:
      return { label: type, icon: CreditCard, cls: "badge-muted" };
  }
}

function maskPhone(phone: string): string {
  if (!phone) return "";
  if (phone.length <= 6) return phone;
  return phone.slice(0, 4) + " *** " + phone.slice(-3);
}

function getAccountPreview(b: ApiBeneficiary): string {
  if (b.iban) return maskIban(b.iban);
  if (b.sortCode && b.accountNumber) return `${b.sortCode} / ****${b.accountNumber.slice(-4)}`;
  if (b.phone) return maskPhone(b.phone);
  return "-";
}

// ─────────────────────────────────────────────
// Skeleton Loader
// ─────────────────────────────────────────────

function BeneficiarySkeleton() {
  return (
    <div className="space-y-3 px-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-4 flex items-center gap-3">
          <div className="skeleton w-11 h-11 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Add Beneficiary Modal
// ─────────────────────────────────────────────

function AddBeneficiaryModal({
  onClose,
  onSave,
  saving,
}: {
  onClose: () => void;
  onSave: (form: NewBeneficiaryForm) => void;
  saving: boolean;
}) {
  const t = useT();
  const [form, setForm] = useState<NewBeneficiaryForm>(INITIAL_FORM);

  const set = useCallback(
    <K extends keyof NewBeneficiaryForm>(key: K, value: NewBeneficiaryForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Auto-fill currency when country changes
  useEffect(() => {
    if (form.country) {
      set("currency", getCurrencyForCountry(form.country));
    }
  }, [form.country, set]);

  const isValid =
    form.name.trim().length >= 2 &&
    form.country !== "" &&
    ((form.type === "iban" && form.iban.trim().length >= 15) ||
      (form.type === "sort_code" &&
        form.sortCode.trim().length >= 6 &&
        form.accountNumber.trim().length >= 6) ||
      (form.type === "mobile_money" && form.phone.trim().length >= 8));

  const TYPE_OPTIONS: { value: BeneficiaryType; label: string; icon: typeof CreditCard }[] = [
    { value: "iban", label: "IBAN", icon: CreditCard },
    { value: "sort_code", label: "Sort Code", icon: Building2 },
    { value: "mobile_money", label: "Mobile Money", icon: Phone },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl overflow-y-auto max-h-[90vh] animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border-light)" }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between p-6 pb-4"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {t("contacts.add_modal.title")}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {t("contacts.add_modal.subtitle")}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 -mr-2">
            <X className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="eyebrow mb-2 block">{t("contacts.add_modal.name")}</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Marie Kabila"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              autoFocus
            />
          </div>

          {/* Type selector */}
          <div>
            <label className="eyebrow mb-2 block">{t("contacts.add_modal.type")}</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = form.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("type", opt.value)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all"
                    style={{
                      borderColor: active
                        ? "var(--cyan-500)"
                        : "var(--border-light)",
                      background: active
                        ? "var(--cyan-muted)"
                        : "var(--bg-card-alt)",
                      color: active
                        ? "var(--cyan-500)"
                        : "var(--text-secondary)",
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="eyebrow mb-2 block">{t("contacts.add_modal.country")}</label>
            <div className="relative">
              <select
                className="input pr-10 appearance-none cursor-pointer"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              >
                <option value="">{t("contacts.add_modal.choose_country")}</option>
                <optgroup label={t("contacts.add_modal.destination_countries")}>
                  {DESTINATION_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "var(--text-secondary)" }}
              />
            </div>
          </div>

          {/* Currency (auto-filled, read-only) */}
          {form.currency && (
            <div>
              <label className="eyebrow mb-2 block">{t("contacts.add_modal.currency")}</label>
              <input
                type="text"
                className="input opacity-70 cursor-not-allowed"
                value={form.currency}
                readOnly
              />
            </div>
          )}

          {/* Conditional fields */}
          {form.type === "iban" && (
            <div>
              <label className="eyebrow mb-2 block">{t("contacts.add_modal.iban")}</label>
              <input
                type="text"
                className="input font-mono tracking-wider"
                placeholder="FR76 3000 6000 0112 3456 7890 189"
                value={form.iban}
                onChange={(e) => set("iban", e.target.value.toUpperCase())}
              />
            </div>
          )}

          {form.type === "sort_code" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="eyebrow mb-2 block">{t("contacts.add_modal.sort_code")}</label>
                <input
                  type="text"
                  className="input font-mono"
                  placeholder="20-30-40"
                  value={form.sortCode}
                  onChange={(e) => set("sortCode", e.target.value)}
                />
              </div>
              <div>
                <label className="eyebrow mb-2 block">{t("contacts.add_modal.account")}</label>
                <input
                  type="text"
                  className="input font-mono"
                  placeholder="12345678"
                  value={form.accountNumber}
                  onChange={(e) => set("accountNumber", e.target.value)}
                />
              </div>
            </div>
          )}

          {form.type === "mobile_money" && (
            <div>
              <label className="eyebrow mb-2 block">{t("contacts.add_modal.phone")}</label>
              <input
                type="tel"
                className="input"
                placeholder="+243 81 234 56 78"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="p-6 pt-2 flex gap-3"
          style={{ borderTop: "1px solid var(--border-light)" }}
        >
          <button onClick={onClose} className="btn-secondary flex-1" type="button">
            {t("common.cancel")}
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!isValid || saving}
            className="btn-primary flex-1"
            type="button"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("contacts.add_modal.saving")}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {t("common.save")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Beneficiary Card
// ─────────────────────────────────────────────

function BeneficiaryCard({
  beneficiary,
  onDelete,
  onToggleFavorite,
}: {
  beneficiary: ApiBeneficiary;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const badge = getTypeBadge(beneficiary.type);
  const BadgeIcon = badge.icon;
  const flag = getFlagForCountry(beneficiary.country);

  return (
    <div className="card p-4 group animate-fade-up">
      <div className="flex items-center gap-3">
        {/* Flag avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border-light)",
          }}
        >
          {flag}
        </div>

        {/* Name + account */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {beneficiary.name}
            </p>
            {beneficiary.isFavorite && (
              <Star
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "var(--warn)", fill: "var(--warn)" }}
              />
            )}
          </div>
          <p
            className="text-xs font-mono tracking-wide mt-0.5 truncate"
            style={{ color: "var(--text-muted)" }}
          >
            {getAccountPreview(beneficiary)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={badge.cls}>
              <BadgeIcon className="w-3 h-3" />
              {badge.label}
            </span>
            {beneficiary.lastUsedAt && (
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {timeAgo(beneficiary.lastUsedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggleFavorite(beneficiary.id)}
            className="p-2 rounded-lg transition-colors"
          >
            <Star
              className="w-4 h-4 transition-colors"
              style={{
                color: beneficiary.isFavorite ? "var(--warn)" : "var(--text-muted)",
                fill: beneficiary.isFavorite ? "var(--warn)" : "none",
              }}
            />
          </button>
          <button
            onClick={() => onDelete(beneficiary.id)}
            className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            style={{ color: "var(--bad)" }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const t = useT();

  return (
    <div className="mx-4 card text-center py-16 animate-fade-up">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "var(--cyan-muted)" }}
      >
        <Users className="w-8 h-8" style={{ color: "var(--cyan-500)" }} />
      </div>
      <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        {t("contacts.empty")}
      </p>
      <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: "var(--text-secondary)" }}>
        {t("contacts.empty_desc")}
      </p>
      <button onClick={onAdd} className="btn-primary mt-6 mx-auto">
        <UserPlus className="w-4 h-4" />
        {t("contacts.add_first")}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function BeneficiariesPage() {
  const t = useT();
  const [beneficiaries, setBeneficiaries] = useState<ApiBeneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch beneficiaries on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<BeneficiariesListResponse>("/api/beneficiaries", {
          devFallback: { beneficiaries: MOCK_BENEFICIARIES },
        });
        setBeneficiaries(data.beneficiaries);
      } catch (err) {
        toast.error(t("contacts.toast.load_error"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return beneficiaries;
    return beneficiaries.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.country.toLowerCase().includes(q) ||
        b.currency.toLowerCase().includes(q) ||
        (b.iban && b.iban.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q))
    );
  }, [beneficiaries, search]);

  // Sort: favorites first, then by last used
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
      const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [filtered]);

  // Add beneficiary
  const handleSave = useCallback(async (form: NewBeneficiaryForm) => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        country: form.country,
        currency: form.currency,
        iban: form.type === "iban" ? form.iban.replace(/\s/g, "") : null,
        sortCode: form.type === "sort_code" ? form.sortCode.trim() : null,
        accountNumber: form.type === "sort_code" ? form.accountNumber.trim() : null,
        phone: form.type === "mobile_money" ? form.phone.trim() : null,
      };

      const mockNew: ApiBeneficiary = {
        id: `ben-${Date.now()}`,
        name: payload.name,
        type: payload.type,
        currency: payload.currency,
        country: payload.country,
        iban: payload.iban,
        phone: payload.phone,
        sortCode: payload.sortCode,
        accountNumber: payload.accountNumber,
        bankName: null,
        isFavorite: false,
        lastUsedAt: null,
        createdAt: new Date().toISOString(),
      };

      const created = await apiPost<ApiBeneficiary>("/api/beneficiaries", payload, mockNew);
      setBeneficiaries((prev) => [created, ...prev]);
      setShowModal(false);
      toast.success(`${created.name} ${t("contacts.toast.added")}`);
    } catch {
      toast.error(t("contacts.toast.add_error"));
      console.error("Failed to add beneficiary");
    } finally {
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delete beneficiary
  const handleDelete = useCallback(async (id: string) => {
    const target = beneficiaries.find((b) => b.id === id);
    if (!target) return;

    const confirmed = window.confirm(
      t("contacts.confirm_delete", { name: target.name })
    );
    if (!confirmed) return;

    try {
      await apiDelete(`/api/beneficiaries?id=${id}`, { success: true });
      setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
      toast.success(`${target.name} ${t("contacts.toast.deleted")}`);
    } catch {
      toast.error(t("contacts.toast.delete_error"));
      console.error("Failed to delete beneficiary");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beneficiaries]);

  // Toggle favorite (local only, optimistic)
  const handleToggleFavorite = useCallback((id: string) => {
    setBeneficiaries((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isFavorite: !b.isFavorite } : b))
    );
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("contacts.title")}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-on-blue-muted)" }}>
            {beneficiaries.length} {t("contacts.count")}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-sm py-2.5 px-4"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">{t("contacts.add")}</span>
        </button>
      </div>

      {/* Search */}
      {!loading && beneficiaries.length > 0 && (
        <div className="px-4">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "rgba(255,255,255,0.4)" }}
            />
            <input
              type="text"
              placeholder={t("contacts.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-on-blue pl-10 w-full text-sm"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <BeneficiarySkeleton />
      ) : beneficiaries.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : sorted.length === 0 ? (
        <div className="mx-4 card text-center py-12 animate-fade-up">
          <Search className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("contacts.no_results")}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {t("contacts.no_results_for")} &laquo; {search} &raquo;
          </p>
        </div>
      ) : (
        <div className="space-y-2 px-4 stagger">
          {sorted.map((b) => (
            <BeneficiaryCard
              key={b.id}
              beneficiary={b}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <AddBeneficiaryModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
