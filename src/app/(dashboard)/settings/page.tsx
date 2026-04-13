"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Coins,
  Bell,
  BellRing,
  Mail,
  Smartphone,
  Shield,
  ChevronRight,
  Trash2,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale, type Locale, LOCALE_NAMES } from "@/lib/i18n";

// Types
type Currency = "EUR" | "GBP" | "CHF" | "USD" | "CAD";

interface NotifPrefs {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// Toggle Switch
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
      style={{ background: checked ? "var(--gradient-cyan)" : "var(--bg-input)" }}
    >
      <div
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)", background: checked ? "var(--blue-900)" : "var(--text-muted)" }}
      />
    </button>
  );
}

// Delete Confirmation Modal
function DeleteModal({ onClose, t }: { onClose: () => void; t: (key: string) => string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card max-w-sm w-full space-y-4 animate-slide-up sm:animate-scale-in mx-4 sm:mx-0">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--bad-bg)" }}>
            <AlertTriangle size={20} style={{ color: "var(--bad)" }} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t("settings.delete_confirm")}</h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t("settings.delete_warning")}</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">{t("common.cancel")}</button>
          <button
            onClick={() => { onClose(); toast.info("Contact support: support@tindacash.com", { duration: 6000 }); }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-all"
            style={{ background: "var(--bad)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <Trash2 size={15} />{t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Languages config - 8 languages
const LANGUAGES: { value: Locale; label: string; flag: string }[] = [
  { value: "fr", label: "Francais", flag: "🇫🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "pt", label: "Portugues", flag: "🇵🇹" },
  { value: "es", label: "Espanol", flag: "🇪🇸" },
  { value: "nl", label: "Nederlands", flag: "🇳🇱" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
  { value: "ln", label: "Lingala", flag: "🇨🇩" },
];

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "EUR", label: "Euro", symbol: "\u20AC" },
  { value: "GBP", label: "Pound", symbol: "\u00A3" },
  { value: "CHF", label: "Franc", symbol: "CHF" },
  { value: "USD", label: "Dollar", symbol: "$" },
  { value: "CAD", label: "CAD", symbol: "C$" },
];

export default function SettingsPage() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [notifs, setNotifs] = useState<NotifPrefs>({ email: true, sms: false, push: true });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem("tinda-currency") as Currency | null;
      if (savedCurrency && ["EUR", "GBP", "CHF", "USD", "CAD"].includes(savedCurrency)) setCurrency(savedCurrency);
      const savedNotifs = localStorage.getItem("tinda-notifs");
      if (savedNotifs) setNotifs(JSON.parse(savedNotifs));
    } catch { /* ignore */ }
  }, []);

  const changeLanguage = (val: Locale) => {
    setLocale(val);
    const label = LANGUAGES.find((l) => l.value === val)?.label ?? val;
    toast.success(`${t("settings.language")}: ${label}`);
  };

  const changeCurrency = (val: Currency) => {
    setCurrency(val);
    localStorage.setItem("tinda-currency", val);
    toast.success(`${t("settings.currency")}: ${val}`);
  };

  const toggleNotif = (key: keyof NotifPrefs) => {
    setNotifs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("tinda-notifs", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 px-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("settings.title")}</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-on-blue-muted)" }}>{t("settings.subtitle")}</p>
      </div>

      {/* Language */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(37,99,235,0.10)" }}>
            <Globe size={18} style={{ color: "var(--blue-500)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t("settings.language")}</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t("settings.language_desc")}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {LANGUAGES.map((lang) => {
            const active = locale === lang.value;
            return (
              <button
                key={lang.value}
                onClick={() => changeLanguage(lang.value)}
                className="relative flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-xl border transition-all duration-200"
                style={{
                  borderColor: active ? "var(--cyan-500)" : "var(--border-light)",
                  background: active ? "var(--cyan-muted)" : "var(--bg-card-alt)",
                }}
              >
                {active && (
                  <div className="absolute top-1.5 right-1.5">
                    <Check size={11} style={{ color: "var(--cyan-500)" }} />
                  </div>
                )}
                <span className="text-base">{lang.flag}</span>
                <span className="text-[10px] font-medium" style={{ color: active ? "var(--cyan-500)" : "var(--text-primary)" }}>
                  {lang.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Currency */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--cyan-muted)" }}>
            <Coins size={18} style={{ color: "var(--cyan-500)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t("settings.currency")}</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t("settings.currency_desc")}</p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {CURRENCIES.map((cur) => {
            const active = currency === cur.value;
            return (
              <button
                key={cur.value}
                onClick={() => changeCurrency(cur.value)}
                className="relative flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-xl border transition-all duration-200"
                style={{
                  borderColor: active ? "var(--cyan-500)" : "var(--border-light)",
                  background: active ? "var(--cyan-muted)" : "var(--bg-card-alt)",
                }}
              >
                {active && <div className="absolute top-1.5 right-1.5"><Check size={11} style={{ color: "var(--cyan-500)" }} /></div>}
                <span className="text-lg font-serif" style={{ color: active ? "var(--cyan-500)" : "var(--text-secondary)" }}>{cur.symbol}</span>
                <span className="text-[10px] font-medium" style={{ color: active ? "var(--cyan-500)" : "var(--text-primary)" }}>{cur.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(37,99,235,0.10)" }}>
            <Bell size={18} style={{ color: "var(--blue-500)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t("settings.notifications")}</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t("settings.notifications_desc")}</p>
          </div>
        </div>
        <div className="space-y-0">
          {[
            { key: "email" as const, icon: Mail, title: t("settings.notif.email"), desc: t("settings.notif.email_desc") },
            { key: "sms" as const, icon: Smartphone, title: t("settings.notif.sms"), desc: t("settings.notif.sms_desc") },
            { key: "push" as const, icon: BellRing, title: t("settings.notif.push"), desc: t("settings.notif.push_desc") },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between py-3.5" style={{ borderBottom: i < 2 ? "1px solid var(--border-light)" : undefined }}>
                <div className="flex items-center gap-3">
                  <Icon size={17} style={{ color: "var(--text-muted)" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                  </div>
                </div>
                <Toggle checked={notifs[item.key]} onChange={() => toggleNotif(item.key)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--cyan-muted)" }}>
            <Shield size={18} style={{ color: "var(--cyan-500)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t("settings.security")}</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t("settings.security_desc")}</p>
          </div>
        </div>
        <Link href="/profile" className="flex items-center justify-between py-3 px-4 -mx-1.5 rounded-xl border transition-all group" style={{ borderColor: "var(--border-light)", background: "var(--bg-card-alt)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t("settings.password.change")}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("settings.password.desc")}</p>
          </div>
          <ChevronRight size={17} style={{ color: "var(--text-muted)" }} />
        </Link>
      </div>

      {/* Account */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--bad-bg)" }}>
            <Trash2 size={18} style={{ color: "var(--bad)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t("settings.account")}</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t("settings.danger")}</p>
          </div>
        </div>
        <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-between py-3 px-4 -mx-1.5 rounded-xl border transition-all group" style={{ borderColor: "rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.04)" }}>
          <div className="text-left">
            <p className="text-sm font-medium" style={{ color: "var(--bad)" }}>{t("settings.delete")}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("settings.delete_desc")}</p>
          </div>
          <ChevronRight size={17} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <p className="text-center text-xs pb-4" style={{ color: "var(--text-on-blue-muted)" }}>Tinda Cash v1.0.0</p>

      {showDeleteModal && <DeleteModal onClose={() => setShowDeleteModal(false)} t={t} />}
    </div>
  );
}
