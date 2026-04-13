"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Send,
  Smartphone,
  Building2,
  ChevronDown,
  Sparkles,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { DESTINATION_COUNTRIES, SEND_COUNTRIES, DEMO_RATES, getDeliveryMethodsForCountry } from "@/lib/corridors";
import { useT } from "@/lib/i18n";

type Step = "destination" | "amount" | "recipient" | "confirm" | "success";
type FlowStep = "destination" | "amount" | "recipient" | "confirm";

const DELIVERY_ICONS: Record<string, typeof Smartphone> = {
  "M-Pesa": Smartphone,
  "Airtel Money": Smartphone,
  "Orange Money": Smartphone,
  "Multicaixa Express": Smartphone,
  "Unitel Money": Smartphone,
  "Virement bancaire": Building2,
  "Cash Pickup": Building2,
  "MTN MoMo": Smartphone,
};

export default function SendPage() {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState<Step>("destination");
  const [destCountry, setDestCountry] = useState("CD");
  const [sendCountry, setSendCountry] = useState("FR");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [amount, setAmount] = useState("100");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);

  const dest = DESTINATION_COUNTRIES.find((c) => c.code === destCountry)!;
  const from = SEND_COUNTRIES.find((c) => c.code === sendCountry)!;
  const rateKey = `${from.currency}-${dest.currency}`;
  const rateData = DEMO_RATES[rateKey];
  const numAmount = parseFloat(amount) || 0;
  const received = rateData ? numAmount * rateData.rate : 0;
  const fee = Math.max(numAmount * 0.008, 0.99);
  const deliveryMethods = useMemo(() => getDeliveryMethodsForCountry(destCountry), [destCountry]);

  const steps: { key: FlowStep; label: string }[] = [
    { key: "destination", label: t("send.step.destination") },
    { key: "amount", label: t("send.step.amount") },
    { key: "recipient", label: t("send.step.recipient") },
    { key: "confirm", label: t("send.step.confirm") },
  ];

  const currentIdx = steps.findIndex((s) => s.key === step);

  const canNext = () => {
    switch (step) {
      case "destination": return !!destCountry && !!deliveryMethod;
      case "amount": return numAmount >= 1;
      case "recipient": return recipientName.length >= 2 && recipientPhone.length >= 6;
      case "confirm": return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === "confirm") {
      handleSubmit();
      return;
    }
    const idx = steps.findIndex((s) => s.key === step);
    if (idx < steps.length - 1) setStep(steps[idx + 1].key);
  };

  const handleBack = () => {
    const idx = steps.findIndex((s) => s.key === step);
    if (idx > 0) setStep(steps[idx - 1].key);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setStep("success");
  };

  // Tier 1 countries shown by default, Tier 2 on expand
  const visibleCountries = showAllCountries ? SEND_COUNTRIES : SEND_COUNTRIES.slice(0, 7);

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center"
      >
        <div className="success-check mb-6">
          <Check size={40} className="text-[#030F0D]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{t("send.success_title")}</h1>
        <p className="text-white/50 mb-2">
          {numAmount.toLocaleString("fr-FR")} {from.currency} → {received.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} {dest.currency}
        </p>
        <p className="text-sm text-white/30 mb-8">
          {recipientName} {t("send.success_message")} {deliveryMethod} {t("send.success_time")}
        </p>
        <div className="flex gap-3">
          <button onClick={() => router.push("/dashboard")} className="btn-secondary bg-transparent border-white/[0.12] text-white/70 hover:text-white">
            {t("send.dashboard")}
          </button>
          <button onClick={() => { setStep("destination"); setRecipientName(""); setRecipientPhone(""); }} className="btn-primary">
            {t("send.new_transfer")} <Send size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={currentIdx > 0 ? handleBack : () => router.back()} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">{t("send.title")}</h1>
          <p className="text-xs text-white/40">{t("send.step")} {currentIdx + 1}/{steps.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex-1 flex items-center gap-2">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= currentIdx ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-white/[0.06]"
            }`} />
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* DESTINATION */}
          {step === "destination" && (
            <div className="space-y-5">
              {/* Send from */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">{t("send.from")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {visibleCountries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setSendCountry(c.code)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                        sendCountry === c.code
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                          : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-[10px] font-medium">{c.currency}</span>
                    </button>
                  ))}
                </div>
                {!showAllCountries && SEND_COUNTRIES.length > 7 && (
                  <button
                    onClick={() => setShowAllCountries(true)}
                    className="mt-2 flex items-center gap-1 text-xs text-cyan-400/70 hover:text-cyan-400 mx-auto"
                  >
                    {t("send.more_countries")} <ChevronDown size={14} />
                  </button>
                )}
              </div>

              {/* Destination */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">{t("send.destination")}</label>
                <div className="grid grid-cols-2 gap-3">
                  {DESTINATION_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setDestCountry(c.code); setDeliveryMethod(""); }}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        destCountry === c.code
                          ? "bg-cyan-500/10 border-cyan-500/30"
                          : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="text-3xl">{c.flag}</span>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-white">{c.name}</div>
                        <div className="text-xs text-white/40">{c.currency} ({c.symbol})</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery method */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">{t("send.delivery_method")}</label>
                <div className="space-y-2">
                  {deliveryMethods.map((m) => {
                    const Icon = DELIVERY_ICONS[m] || Smartphone;
                    return (
                      <button
                        key={m}
                        onClick={() => setDeliveryMethod(m)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                          deliveryMethod === m
                            ? "bg-cyan-500/10 border-cyan-500/30"
                            : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          deliveryMethod === m ? "bg-cyan-500/20 text-cyan-400" : "bg-white/[0.06] text-white/40"
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-sm font-medium text-white">{m}</div>
                          <div className="text-[10px] text-white/30">
                            {m.includes("bancaire") || m === "Cash Pickup" ? t("send.bank_time") : t("send.instant_time")}
                          </div>
                        </div>
                        {deliveryMethod === m && <Check size={16} className="text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* AMOUNT */}
          {step === "amount" && (
            <div className="space-y-5">
              <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.08] rounded-2xl" />
                <div className="relative p-6 space-y-6">
                  <div>
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">{t("send.you_send")}</label>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-2xl">{from.flag}</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 bg-transparent text-3xl font-bold text-white outline-none"
                        min="1"
                        autoFocus
                      />
                      <span className="text-lg font-semibold text-white/50">{from.currency}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06]" />

                  <div>
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">{t("send.they_receive")}</label>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-2xl">{dest.flag}</span>
                      <span className="flex-1 text-3xl font-bold text-gradient-cyan">
                        {received.toLocaleString("fr-FR", { maximumFractionDigits: dest.currency === "AOA" || dest.currency === "CDF" ? 0 : 2 })}
                      </span>
                      <span className="text-lg font-semibold text-white/50">{dest.currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/40">
                  <span>{t("send.rate")}</span>
                  <span className="text-white/60">1 {from.currency} = {rateData?.rate.toLocaleString("fr-FR")} {dest.currency}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>{t("send.fee")}</span>
                  <span className="text-white/60">{fee.toFixed(2)} {from.currency}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>{t("send.delivery_method")}</span>
                  <span className="text-white/60">{deliveryMethod}</span>
                </div>
                <div className="border-t border-white/[0.06] pt-2 flex justify-between font-semibold">
                  <span className="text-white/60">{t("send.total")}</span>
                  <span className="text-white">{(numAmount + fee).toFixed(2)} {from.currency}</span>
                </div>
              </div>

              {/* AI suggestion */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/10">
                <Sparkles size={16} className="text-violet-400 shrink-0" />
                <p className="text-xs text-white/50">
                  <span className="text-violet-400 font-semibold">{t("send.ai_tip")}</span> {numAmount > 200 ? t("send.ai_big") : t("send.ai_small")}
                </p>
              </div>
            </div>
          )}

          {/* RECIPIENT */}
          {step === "recipient" && (
            <div className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">{t("send.recipient_name")}</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Ex: Marie Kabanga"
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
                    {deliveryMethod.includes("bancaire") ? t("send.account_number") : t("send.recipient_phone")}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-3.5 text-sm text-white/50">
                      {dest.flag} +{dest.dialCode}
                    </span>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder={deliveryMethod.includes("bancaire") ? "Account number" : "812345678"}
                      className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Saved beneficiaries */}
              <div>
                <span className="text-xs font-semibold text-white/40 mb-2 block">{t("send.saved_contacts")}</span>
                <div className="space-y-2">
                  {[
                    { name: "Marie K.", phone: "812345678", country: "🇨🇩" },
                    { name: "Paulo M.", phone: "923456789", country: "🇦🇴" },
                    { name: "David N.", phone: "068123456", country: "🇨🇬" },
                  ].filter(b => (destCountry === "CD" && b.country === "🇨🇩") || (destCountry === "AO" && b.country === "🇦🇴") || (destCountry === "CG" && b.country === "🇨🇬"))
                  .map((b) => (
                    <button
                      key={b.name}
                      onClick={() => { setRecipientName(b.name); setRecipientPhone(b.phone); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-left"
                    >
                      <div className="avatar-sm text-xs">{b.name.split(" ").map(w => w[0]).join("")}</div>
                      <div>
                        <div className="text-sm font-medium text-white">{b.name}</div>
                        <div className="text-xs text-white/30">{b.country} +{dest.dialCode}{b.phone}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONFIRM */}
          {step === "confirm" && (
            <div className="space-y-5">
              <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.08] to-blue-500/[0.04]" />
                <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.08] rounded-2xl" />
                <div className="relative p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white/70">{t("send.summary")}</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/40">{t("send.you_send")}</span>
                      <span className="text-sm font-semibold text-white">{numAmount.toLocaleString("fr-FR")} {from.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/40">{t("send.they_receive")}</span>
                      <span className="text-sm font-bold text-gradient-cyan">{received.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} {dest.currency}</span>
                    </div>
                    <div className="border-t border-white/[0.06]" />
                    <div className="flex justify-between">
                      <span className="text-sm text-white/40">{t("send.step.recipient")}</span>
                      <span className="text-sm text-white">{recipientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/40">{t("send.recipient_phone")}</span>
                      <span className="text-sm text-white">+{dest.dialCode}{recipientPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/40">{t("send.destination")}</span>
                      <span className="text-sm text-white">{dest.flag} {dest.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/40">{t("send.delivery_method")}</span>
                      <span className="text-sm text-white">{deliveryMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/40">{t("send.fee")}</span>
                      <span className="text-sm text-white">{fee.toFixed(2)} {from.currency}</span>
                    </div>
                    <div className="border-t border-white/[0.06] pt-2 flex justify-between">
                      <span className="text-sm font-semibold text-white/60">{t("send.total")}</span>
                      <span className="text-lg font-bold text-white">{(numAmount + fee).toFixed(2)} {from.currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <Shield size={14} />, text: t("send.secure") },
                  { icon: <Zap size={14} />, text: t("send.instant") },
                  { icon: <Clock size={14} />, text: "< 5 min" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white/[0.03] border border-white/[0.04] text-xs text-white/40">
                    <span className="text-cyan-400">{b.icon}</span> {b.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      {(step as string) !== "success" && (
        <button
          onClick={handleNext}
          disabled={!canNext() || isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#030F0D]/30 border-t-[#030F0D] rounded-full animate-spin" />
              {t("send.processing")}
            </span>
          ) : step === "confirm" ? (
            <>{t("send.confirm_send")} <Send size={16} /></>
          ) : (
            <>{t("common.continue")} <ArrowRight size={16} /></>
          )}
        </button>
      )}
    </div>
  );
}
