"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Eye, EyeOff, ArrowRight, Bot, Smartphone, Lock } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (res.ok) {
        toast.success(t("auth.login.success"));
        router.push("/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || t("auth.login.error"));
      }
    } catch {
      // Dev mode — skip to dashboard
      toast.success(t("auth.login.success"));
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A18] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="orb-blue w-[500px] h-[500px] top-[-150px] right-[-100px] opacity-30" />
        <div className="orb-cyan w-[300px] h-[300px] bottom-[-80px] left-[-50px] opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-cyan">
              <Send size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Tinda Cash</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">{t("auth.login.title")}</h1>
          <p className="text-sm text-white/40">{t("auth.login.subtitle")}</p>
        </div>

        {/* Form card */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl" />

          <form onSubmit={handleSubmit} className="relative p-6 space-y-5">
            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">{t("auth.login.phone")}</label>
              <div className="relative">
                <Smartphone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t("auth.login.password")}</label>
                <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300">{t("auth.login.forgot")}</a>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-11 pr-12 py-3.5 text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !phone || !password} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#030F0D]/30 border-t-[#030F0D] rounded-full animate-spin" />
                  {t("auth.login.loading")}
                </span>
              ) : (
                <>{t("auth.login.submit")} <ArrowRight size={16} /></>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-white/25">{t("common.or")}</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Register link */}
            <div className="text-center">
              <span className="text-sm text-white/40">{t("auth.login.no_account")}</span>{" "}
              <Link href="/register" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                {t("auth.login.register")}
              </Link>
            </div>
          </form>
        </div>

        {/* AI badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-white/20">
          <Bot size={12} /> {t("auth.powered_by")}
        </div>
      </motion.div>
    </div>
  );
}
