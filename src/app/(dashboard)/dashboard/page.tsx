"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Send,
  Clock,
  TrendingUp,
  Wallet,
  Plus,
  Bell,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { DEMO_RATES } from "@/lib/corridors";
import { useT } from "@/lib/i18n";

// Mock Data
const MOCK_USER = { firstName: "Lionel" };

const MOCK_WALLETS = [
  { currency: "EUR", symbol: "€", balance: 1250.00, change: "+2.3%" },
  { currency: "USD", symbol: "$", balance: 480.50, change: "+0.5%" },
  { currency: "GBP", symbol: "£", balance: 320.00, change: "-0.2%" },
];

const MOCK_TRANSACTIONS = [
  { id: "1", to: "Marie K.", toCountry: "🇨🇩", toCurrency: "USD", toAmount: 200, fromAmount: 185, fromCurrency: "EUR", status: "completed", method: "M-Pesa", date: "13 avr." },
  { id: "2", to: "Paulo M.", toCountry: "🇦🇴", toCurrency: "AOA", toAmount: 98000, fromAmount: 100, fromCurrency: "EUR", status: "completed", method: "Multicaixa", date: "10 avr." },
  { id: "3", to: "Jean B.", toCountry: "🇨🇩", toCurrency: "USD", toAmount: 500, fromAmount: 462, fromCurrency: "EUR", status: "processing", method: "Airtel Money", date: "8 avr." },
  { id: "4", to: "Ana R.", toCountry: "🇦🇴", toCurrency: "AOA", toAmount: 49000, fromAmount: 50, fromCurrency: "EUR", status: "completed", method: "Unitel Money", date: "5 avr." },
  { id: "5", to: "Patrick N.", toCountry: "🇨🇩", toCurrency: "USD", toAmount: 150, fromAmount: 139, fromCurrency: "EUR", status: "completed", method: "Orange Money", date: "1 avr." },
  { id: "6", to: "David M.", toCountry: "🇨🇬", toCurrency: "XAF", toAmount: 32798, fromAmount: 50, fromCurrency: "EUR", status: "completed", method: "Airtel Money", date: "28 mars" },
];

const MOCK_BENEFICIARIES = [
  { id: "1", name: "Marie K.", country: "🇨🇩", method: "M-Pesa", initials: "MK" },
  { id: "2", name: "Paulo M.", country: "🇦🇴", method: "Multicaixa", initials: "PM" },
  { id: "3", name: "Jean B.", country: "🇨🇩", method: "Airtel", initials: "JB" },
  { id: "4", name: "Ana R.", country: "🇦🇴", method: "Unitel", initials: "AR" },
  { id: "5", name: "David M.", country: "🇨🇬", method: "Airtel", initials: "DM" },
];

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [greeting, setGreeting] = useState("");
  const t = useT();

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting(t("dashboard.greeting.morning"));
    else if (h < 18) setGreeting(t("dashboard.greeting.afternoon"));
    else setGreeting(t("dashboard.greeting.evening"));
  }, [t]);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: t("status.completed"), color: "text-emerald-400", bg: "bg-emerald-500/10" },
    processing: { label: t("status.processing"), color: "text-yellow-400", bg: "bg-yellow-500/10" },
    pending: { label: t("status.pending"), color: "text-blue-400", bg: "bg-blue-500/10" },
    failed: { label: t("status.failed"), color: "text-red-400", bg: "bg-red-500/10" },
  };

  const totalEUR = MOCK_WALLETS.reduce((sum, w) => {
    if (w.currency === "EUR") return sum + w.balance;
    if (w.currency === "USD") return sum + w.balance / 1.08;
    if (w.currency === "GBP") return sum + w.balance / 0.86;
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}, {MOCK_USER.firstName} 👋</h1>
          <p className="text-sm text-white/40 mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <button className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-colors">
          <Bell size={18} className="text-white/50" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-[#050A18]" />
        </button>
      </motion.div>

      {/* Wallet */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10" />
        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-cyan-400" />
              <span className="text-sm font-medium text-white/60">{t("dashboard.balance")}</span>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="text-white/40 hover:text-white/60 transition-colors">
              {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <div className="mb-6">
            <span className="amount text-white">{showBalance ? `${totalEUR.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €` : "••••••"}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {MOCK_WALLETS.map((w) => (
              <div key={w.currency} className="shrink-0 bg-white/[0.06] rounded-xl px-4 py-3 border border-white/[0.06] min-w-[140px]">
                <div className="text-xs text-white/40 mb-1">{w.currency}</div>
                <div className="text-lg font-bold text-white">{showBalance ? `${w.symbol}${w.balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}` : "••••"}</div>
                <div className={`text-[10px] mt-1 ${w.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{w.change} {t("dashboard.this_week")}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-4 gap-3">
        {[
          { icon: <Send size={20} />, label: t("dashboard.actions.send"), href: "/send", gradient: "from-cyan-500 to-blue-500" },
          { icon: <Plus size={20} />, label: t("dashboard.actions.add"), href: "/beneficiaries", gradient: "from-violet-500 to-purple-500" },
          { icon: <Clock size={20} />, label: t("dashboard.actions.history"), href: "/history", gradient: "from-orange-500 to-amber-500" },
          { icon: <TrendingUp size={20} />, label: t("dashboard.actions.rates"), href: "#", gradient: "from-emerald-500 to-green-500" },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>{a.icon}</div>
            <span className="text-xs font-medium text-white/60 group-hover:text-white/80">{a.label}</span>
          </Link>
        ))}
      </motion.div>

      {/* AI Insight */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/[0.08] to-cyan-500/[0.08]" />
        <div className="absolute inset-0 bg-white/[0.02] border border-white/[0.06] rounded-xl" />
        <div className="relative p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-violet-400 mb-0.5">{t("dashboard.ai_insight")}</div>
            <p className="text-xs text-white/50 leading-relaxed">{t("dashboard.ai_tip")}</p>
          </div>
          <Link href="/send" className="shrink-0 text-xs font-semibold text-cyan-400 hover:text-cyan-300">{t("common.send")} →</Link>
        </div>
      </motion.div>

      {/* Quick Send */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/70">{t("dashboard.send_again")}</h2>
          <Link href="/beneficiaries" className="text-xs text-cyan-400 hover:text-cyan-300">{t("dashboard.see_all")} <ChevronRight size={12} className="inline" /></Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {MOCK_BENEFICIARIES.map((b) => (
            <Link key={b.id} href={`/send?to=${b.id}`} className="shrink-0 flex flex-col items-center gap-2 group">
              <div className="avatar w-12 h-12 text-sm group-hover:scale-105 transition-transform">{b.initials}</div>
              <div className="text-center">
                <div className="text-xs font-medium text-white/70 group-hover:text-white/90">{b.name.split(" ")[0]}</div>
                <div className="text-[10px] text-white/30">{b.country} {b.method}</div>
              </div>
            </Link>
          ))}
          <Link href="/beneficiaries" className="shrink-0 flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-dashed border-white/[0.12] flex items-center justify-center group-hover:border-cyan-500/30 transition-colors">
              <Plus size={18} className="text-white/30 group-hover:text-cyan-400" />
            </div>
            <span className="text-xs text-white/30">{t("dashboard.new")}</span>
          </Link>
        </div>
      </motion.div>

      {/* Live Rates */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/70">{t("dashboard.live_rates")}</h2>
          <button className="text-white/30 hover:text-white/50"><RefreshCw size={14} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { pair: "EUR-USD", from: "🇪🇺 EUR", to: "🇨🇩 USD" },
            { pair: "EUR-XAF", from: "🇪🇺 EUR", to: "🇨🇬 XAF" },
            { pair: "EUR-AOA", from: "🇪🇺 EUR", to: "🇦🇴 AOA" },
            { pair: "GBP-USD", from: "🇬🇧 GBP", to: "🇨🇩 USD" },
          ].map((r) => {
            const rate = DEMO_RATES[r.pair];
            return (
              <div key={r.pair} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white/50">{r.from} → {r.to}</span>
                  <TrendingUp size={12} className="text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-white">{rate?.rate.toLocaleString("fr-FR")}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/70">{t("dashboard.recent")}</h2>
          <Link href="/history" className="text-xs text-cyan-400 hover:text-cyan-300">{t("dashboard.all_transactions")} <ChevronRight size={12} className="inline" /></Link>
        </div>
        <div className="space-y-2">
          {MOCK_TRANSACTIONS.map((tx) => {
            const st = statusConfig[tx.status] || statusConfig.pending;
            return (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-base shrink-0">{tx.toCountry}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{tx.to}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${st.bg} ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="text-[11px] text-white/30 mt-0.5">{tx.method} · {tx.date}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-white">-{tx.fromAmount} {tx.fromCurrency}</div>
                  <div className="text-[11px] text-white/30">+{tx.toAmount.toLocaleString("fr-FR")} {tx.toCurrency}</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
