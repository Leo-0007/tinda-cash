"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Eye, EyeOff, ArrowRight, Bot, Smartphone, Lock, User, Mail, Globe, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SEND_COUNTRIES } from "@/lib/corridors";
import { useT } from "@/lib/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("FR");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCountry = SEND_COUNTRIES.find((c) => c.code === country);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, email, country, password }),
      });

      if (res.ok) {
        toast.success(t("auth.register.toast_created"));
        setStep(2);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || t("auth.register.toast_error"));
      }
    } catch {
      // Dev mode
      toast.success(t("auth.register.toast_created_dev"));
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });

      if (res.ok) {
        toast.success(t("auth.register.toast_verified"));
        router.push("/dashboard");
      } else {
        toast.error(t("auth.register.toast_wrong_code"));
      }
    } catch {
      toast.success(t("auth.register.toast_verified_dev"));
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A18] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="orb-cyan w-[500px] h-[500px] top-[-150px] left-[-100px] opacity-25" />
        <div className="orb-blue w-[300px] h-[300px] bottom-[-80px] right-[-50px] opacity-20" />
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
          <h1 className="text-2xl font-bold text-white mb-2">
            {step === 1 ? t("auth.register.title") : t("auth.register.verify_title")}
          </h1>
          <p className="text-sm text-white/40">
            {step === 1
              ? t("auth.register.subtitle")
              : `${t("auth.register.verify_subtitle")} ${phone}`}
          </p>
        </div>

        {/* Form */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl" />

          {step === 1 ? (
            <form onSubmit={handleStep1} className="relative p-6 space-y-4">
              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">{t("auth.register.firstname")}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t("auth.register.firstname")}
                      className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">{t("auth.register.lastname")}</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t("auth.register.lastname")}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">{t("auth.register.country")}</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-3 py-3 text-sm text-white outline-none focus:border-cyan-500/40 transition-colors appearance-none cursor-pointer"
                  >
                    {SEND_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#0A1628] text-white">
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">{t("auth.register.phone")}</label>
                <div className="flex gap-2">
                  <span className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white/50 shrink-0">
                    {selectedCountry?.flag} +{selectedCountry?.dialCode}
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="6 12 34 56 78"
                    className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email (optional) */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">{t("auth.register.email")} <span className="text-white/20">{t("auth.register.email_optional")}</span></label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">{t("auth.register.password")}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.register.password_hint")}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#030F0D]/30 border-t-[#030F0D] rounded-full animate-spin" />
                    {t("auth.register.loading")}
                  </span>
                ) : (
                  <>{t("auth.register.submit")} <ArrowRight size={16} /></>
                )}
              </button>

              <p className="text-[11px] text-white/25 text-center leading-relaxed">
                {t("auth.register.terms")}{" "}
                <a href="/terms" className="text-cyan-400/60 hover:text-cyan-400">{t("auth.register.terms_link")}</a>{" "}
                {t("auth.register.privacy")}{" "}
                <a href="/privacy" className="text-cyan-400/60 hover:text-cyan-400">{t("auth.register.privacy_link")}</a>.
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-white/25">{t("common.or")}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <div className="text-center">
                <span className="text-sm text-white/40">{t("auth.register.has_account")}</span>{" "}
                <Link href="/login" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">{t("auth.register.login")}</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="relative p-6 space-y-5">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={28} className="text-cyan-400" />
                </div>
                <p className="text-sm text-white/50">{t("auth.register.otp_sent")}</p>
              </div>

              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-4 text-2xl font-bold text-center text-white tracking-[0.5em] placeholder:text-white/15 outline-none focus:border-cyan-500/40 transition-colors"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#030F0D]/30 border-t-[#030F0D] rounded-full animate-spin" />
                    {t("auth.register.verifying")}
                  </span>
                ) : (
                  <>{t("auth.register.verify")} <CheckCircle2 size={16} /></>
                )}
              </button>

              <button type="button" onClick={() => toast.info(t("auth.register.toast_resent"))} className="w-full text-sm text-white/40 hover:text-white/60 text-center">
                {t("auth.register.resend")}
              </button>
            </form>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-white/20">
          <Bot size={12} /> {t("auth.powered_by")}
        </div>
      </motion.div>
    </div>
  );
}
