"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Camera,
  Phone,
  Mail,
  MapPin,
  Lock,
  LogOut,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, apiPost, apiPut, ApiError } from "@/lib/api";
import type { ApiUser, AuthMeResponse } from "@/lib/types";
import { AFRICAN_COUNTRIES, EUROPEAN_COUNTRIES } from "@/lib/corridors";
import { useT } from "@/lib/i18n";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type KycStatus = "not_started" | "pending" | "approved" | "rejected";
type NotifChannel = "push" | "email" | "sms";

interface NotifSettings {
  transfers: Record<NotifChannel, boolean>;
  security: Record<NotifChannel, boolean>;
  promos: Record<NotifChannel, boolean>;
}

interface KycInitResponse {
  success: boolean;
  sdkToken: string;
  applicantId: string;
  devMode?: boolean;
}

// ─────────────────────────────────────────────
// Fallback user (dev mode only)
// ─────────────────────────────────────────────

const FALLBACK_USER: ApiUser = {
  id: "dev-fallback",
  firstName: "Lionel",
  lastName: "Ntumba",
  email: "lionel.ntumba@gmail.com",
  phone: "+33 6 12 34 56 78",
  country: "FR",
  kycStatus: "not_started",
  kycLevel: 0,
  phoneVerified: true,
  referralCode: "LIONEL2024",
  createdAt: new Date(2024, 0, 15).toISOString(),
  wallets: [],
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getCountryDisplay(countryCode: string): { flag: string; name: string } {
  const all = [...AFRICAN_COUNTRIES, ...EUROPEAN_COUNTRIES];
  const found = all.find((c) => c.code === countryCode);
  if (found) return { flag: found.flag, name: found.name };
  return { flag: "\u{1F3F3}\uFE0F", name: countryCode };
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ─────────────────────────────────────────────
// KYC Section
// ─────────────────────────────────────────────

function KycSection({
  status,
  onKycInitiated,
}: {
  status: KycStatus;
  onKycInitiated: () => void;
}) {
  const t = useT();
  const [step, setStep] = useState<"overview" | "document" | "selfie" | "done">(
    "overview"
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await apiPost<KycInitResponse>("/api/kyc", {});
      if (res.success) {
        setStep("done");
        onKycInitiated();
        if (res.devMode) {
          toast.success("Mode dev -- KYC simule, statut passe en 'pending'");
        } else {
          toast.success("Documents envoyes -- verification en cours (24-48h)");
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors de l'envoi des documents");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "approved") {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--ok-bg)" }}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: "var(--ok)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--ok)" }}>
              {t("profile.kyc.verified")}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {t("profile.kyc.verified_desc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending" || step === "done") {
    return (
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(37,99,235,0.10)" }}
          >
            <Clock className="w-5 h-5 animate-pulse" style={{ color: "var(--blue-500)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--blue-500)" }}>
              {t("profile.kyc.pending")}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {t("profile.kyc.pending_desc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not started or rejected
  if (step === "overview") {
    const isRejected = status === "rejected";
    return (
      <div className="card space-y-4">
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: isRejected ? "var(--bad-bg)" : "var(--warn-bg)",
            border: `1px solid ${isRejected ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
          }}
        >
          <AlertCircle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: isRejected ? "var(--bad)" : "var(--warn)" }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: isRejected ? "var(--bad)" : "var(--warn)" }}
            >
              {isRejected ? t("profile.kyc.rejected") : t("profile.kyc.required")}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {isRejected
                ? t("profile.kyc.rejected_desc")
                : t("profile.kyc.required_desc")}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { icon: "\u{1FAAA}", text: "Carte d'identite nationale" },
            { icon: "\u{1F4D8}", text: "Passeport valide" },
            { icon: "\u{1F697}", text: "Permis de conduire" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep("document")}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          {t("profile.kyc.button")}
        </button>
      </div>
    );
  }

  if (step === "document") {
    return (
      <div className="card space-y-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("profile.kyc.step1")}
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Prenez une photo recto/verso de votre document
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {["Recto", "Verso"].map((side) => (
            <label
              key={side}
              className="flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
              style={{
                borderColor: "var(--border-light)",
                background: "var(--bg-card-alt)",
              }}
            >
              <Upload className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {side}
              </span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep("overview")}
            className="btn-secondary flex-1"
          >
            {t("common.back")}
          </button>
          <button
            onClick={() => setStep("selfie")}
            className="btn-primary flex-1"
          >
            {t("common.continue")}
          </button>
        </div>
      </div>
    );
  }

  if (step === "selfie") {
    return (
      <div className="card space-y-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("profile.kyc.step2")}
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Prenez un selfie en tenant votre document
          </p>
        </div>

        <label
          className="flex flex-col items-center justify-center gap-3 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
          style={{
            borderColor: "var(--border-light)",
            background: "var(--bg-card-alt)",
          }}
        >
          <Camera className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Cliquez pour prendre votre selfie
          </span>
          <input type="file" accept="image/*" capture="user" className="hidden" />
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => setStep("document")}
            className="btn-secondary flex-1"
          >
            {t("common.back")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("common.confirm")
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────
// Info Row
// ─────────────────────────────────────────────

function InfoRow({
  label,
  value,
  icon: Icon,
  editable = false,
}: {
  label: string;
  value: string;
  icon: typeof User;
  editable?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: "1px solid var(--border-light)" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--bg-input)" }}
      >
        <Icon className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </p>
      </div>
      {editable && (
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Toggle Switch
// ─────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors"
      style={{
        background: checked ? "var(--gradient-cyan)" : "var(--bg-input)",
      }}
    >
      <div
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{
          transform: checked ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </button>
  );
}

// ─────────────────────────────────────────────
// Password Change
// ─────────────────────────────────────────────

function PasswordChange() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPass !== form.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.newPass.length < 8) {
      toast.error("Minimum 8 caracteres");
      return;
    }
    setLoading(true);
    try {
      await apiPut<{ success: boolean; message: string }>(
        "/api/auth/password",
        {
          currentPassword: form.current,
          newPassword: form.newPass,
        }
      );
      setOpen(false);
      setForm({ current: "", newPass: "", confirm: "" });
      toast.success("Mot de passe modifie avec succes");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors du changement de mot de passe");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ borderTop: "1px solid var(--border-light)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--bg-input)" }}
          >
            <Lock className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          </div>
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            {t("profile.password.change")}
          </span>
        </div>
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0)",
          }}
        />
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="pb-3 space-y-3">
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("profile.password.current")}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={form.current}
                onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
                className="input w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                {showCurrent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("profile.password.new")}
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={form.newPass}
                onChange={(e) => setForm((f) => ({ ...f, newPass: e.target.value }))}
                className="input w-full pr-10"
                placeholder="8 caracteres minimum"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("profile.password.confirm")}
            </label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              className="input w-full"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("profile.password.update")}
          </button>
        </form>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Referral Card
// ─────────────────────────────────────────────

function ReferralCard({ code }: { code: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(t("profile.referral.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-2xl">{"\u{1F381}"}</div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("profile.referral.invite")}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {t("profile.referral.bonus")}
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-2 p-3 rounded-xl"
        style={{ background: "var(--bg-input)" }}
      >
        <span
          className="flex-1 font-mono text-sm font-bold tracking-wider"
          style={{ color: "var(--cyan-500)" }}
        >
          {code}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: copied ? "var(--ok-bg)" : "var(--cyan-muted)",
            color: copied ? "var(--ok)" : "var(--cyan-500)",
          }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? t("profile.referral.copied") : t("profile.referral.copy")}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Notification Settings
// ─────────────────────────────────────────────

function NotifSettingsSection() {
  const t = useT();
  const [settings, setSettings] = useState<NotifSettings>({
    transfers: { push: true, email: true, sms: false },
    security: { push: true, email: true, sms: true },
    promos: { push: false, email: true, sms: false },
  });

  const toggle = (
    category: keyof NotifSettings,
    channel: NotifChannel
  ) => {
    setSettings((s) => ({
      ...s,
      [category]: {
        ...s[category],
        [channel]: !s[category][channel],
      },
    }));
  };

  const CATEGORIES = [
    {
      key: "transfers" as const,
      label: t("profile.notif.transfers"),
      desc: "Confirmations, mises a jour de statut",
    },
    {
      key: "security" as const,
      label: t("profile.notif.security"),
      desc: "Connexions, tentatives suspectes",
    },
    {
      key: "promos" as const,
      label: t("profile.notif.promos"),
      desc: "Offres speciales, nouvelles fonctionnalites",
    },
  ];

  return (
    <div className="card space-y-4">
      <h3
        className="text-sm font-semibold flex items-center gap-2"
        style={{ color: "var(--text-primary)" }}
      >
        <Bell className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
        {t("profile.notifications")}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th
                className="text-left text-xs pb-3 font-medium w-full"
                style={{ color: "var(--text-muted)" }}
              >
                Type
              </th>
              <th
                className="text-center text-xs pb-3 font-medium px-3 whitespace-nowrap"
                style={{ color: "var(--text-muted)" }}
              >
                Push
              </th>
              <th
                className="text-center text-xs pb-3 font-medium px-3 whitespace-nowrap"
                style={{ color: "var(--text-muted)" }}
              >
                Email
              </th>
              <th
                className="text-center text-xs pb-3 font-medium px-3 whitespace-nowrap"
                style={{ color: "var(--text-muted)" }}
              >
                SMS
              </th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat, i) => (
              <tr
                key={cat.key}
                style={{
                  borderTop: i > 0 ? "1px solid var(--border-light)" : undefined,
                }}
              >
                <td className="py-3">
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {cat.label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {cat.desc}
                  </p>
                </td>
                {(["push", "email", "sms"] as NotifChannel[]).map((channel) => (
                  <td key={channel} className="py-3 px-3 text-center">
                    <div className="flex justify-center">
                      <Toggle
                        checked={settings[cat.key][channel]}
                        onChange={() => toggle(cat.key, channel)}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 animate-fade-up">
      {/* Blue header area */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <div className="skeleton-blue w-[72px] h-[72px] rounded-full mb-3" />
        <div className="skeleton-blue h-5 w-36 rounded mb-2" />
        <div className="skeleton-blue h-4 w-28 rounded" />
      </div>

      {/* Cards */}
      <div className="card space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="skeleton w-9 h-9 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-4 w-40 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="skeleton h-12 w-full rounded-2xl" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const t = useT();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const { user: userData } = await apiFetch<AuthMeResponse>("/api/auth/me", {
        devFallback: { user: FALLBACK_USER },
      });
      setUser(userData);
    } catch {
      // apiFetch already redirects to /login on 401
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiPost<{ success: boolean }>("/api/auth/logout", {});
    } catch {
      // Always redirect even if the call fails
    } finally {
      router.push("/login");
    }
  };

  const handleKycInitiated = () => {
    setUser((prev) => (prev ? { ...prev, kycStatus: "pending" } : prev));
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return null;
  }

  const kycStatus = user.kycStatus as KycStatus;
  const country = getCountryDisplay(user.country);
  const initials = getInitials(user.firstName, user.lastName);
  const joinedDate = new Date(user.createdAt);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      {/* Blue header with avatar */}
      <div className="flex flex-col items-center px-4 pt-2 pb-4">
        <div className="avatar-lg text-xl mb-3">
          {initials}
        </div>
        <h1 className="text-xl font-bold text-white">
          {user.firstName} {user.lastName}
        </h1>
        <p style={{ color: "var(--text-on-blue-muted)" }} className="text-sm mt-0.5">
          {country.flag} {country.name}
        </p>
        <p style={{ color: "var(--text-on-blue-muted)" }} className="text-xs mt-0.5">
          {user.email}
        </p>
        <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-xs mt-1">
          {t("profile.member_since")}{" "}
          {joinedDate.toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* KYC */}
      <div className="px-4">
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-on-blue-muted)" }}
        >
          {t("profile.kyc.title")}
        </h2>
        <KycSection status={kycStatus} onKycInitiated={handleKycInitiated} />
      </div>

      {/* Personal info */}
      <div className="px-4">
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-on-blue-muted)" }}
        >
          {t("profile.personal")}
        </h2>
        <div className="card">
          <InfoRow
            label={t("profile.phone")}
            value={user.phone}
            icon={Phone}
            editable
          />
          <InfoRow
            label={t("profile.email")}
            value={user.email ?? "--"}
            icon={Mail}
            editable
          />
          <InfoRow
            label={t("profile.country")}
            value={`${country.flag} ${country.name}`}
            icon={MapPin}
          />
          <PasswordChange />
        </div>
      </div>

      {/* Notifications */}
      <div className="px-4">
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-on-blue-muted)" }}
        >
          {t("profile.notifications")}
        </h2>
        <NotifSettingsSection />
      </div>

      {/* Referral */}
      {user.referralCode && (
        <div className="px-4">
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--text-on-blue-muted)" }}
          >
            {t("profile.referral")}
          </h2>
          <ReferralCard code={user.referralCode} />
        </div>
      )}

      {/* Limits */}
      <div className="px-4">
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-on-blue-muted)" }}
        >
          {t("profile.limits")}
        </h2>
        <div className="card space-y-3">
          {[
            {
              label: t("profile.limits.monthly"),
              current: 1000,
              max: kycStatus === "approved" ? 10000 : 1000,
              currency: "EUR",
            },
            {
              label: t("profile.limits.per_tx"),
              current: 500,
              max: kycStatus === "approved" ? 2500 : 500,
              currency: "EUR",
            },
          ].map((limit) => {
            const pct = (limit.current / limit.max) * 100;
            return (
              <div key={limit.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span style={{ color: "var(--text-secondary)" }}>{limit.label}</span>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {limit.current.toLocaleString("fr-FR")} /{" "}
                    {limit.max.toLocaleString("fr-FR")} {limit.currency}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--bg-input)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: "var(--gradient-cyan)",
                    }}
                  />
                </div>
              </div>
            );
          })}
          {kycStatus !== "approved" && (
            <p className="text-xs pt-1" style={{ color: "var(--text-muted)" }}>
              {t("profile.limits.unlock")}
            </p>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-4">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            background: "var(--bad-bg)",
            color: "var(--bad)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          {loggingOut ? t("profile.logout.loading") : t("profile.logout")}
        </button>

        {/* App info */}
        <p
          className="text-center text-xs mt-4"
          style={{ color: "var(--text-on-blue-muted)" }}
        >
          Tinda Cash v1.0.0 -- 2024
        </p>
      </div>
    </div>
  );
}
