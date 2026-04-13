"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Send,
  Shield,
  Zap,
  Clock,
  Globe,
  Star,
  ChevronDown,
  Smartphone,
  CreditCard,
  Bot,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  ArrowLeftRight,
  Menu,
  X,
  Users,
  Lock,
  Cpu,
} from "lucide-react";
import { CORRIDORS, DEMO_RATES, DESTINATION_COUNTRIES, SEND_COUNTRIES } from "@/lib/corridors";
import { useT, useLocale, type Locale } from "@/lib/i18n";

const LOCALE_OPTIONS: { code: Locale; flag: string; label: string }[] = [
  { code: "fr", flag: "\u{1F1EB}\u{1F1F7}", label: "FR" },
  { code: "en", flag: "\u{1F1EC}\u{1F1E7}", label: "EN" },
  { code: "pt", flag: "\u{1F1F5}\u{1F1F9}", label: "PT" },
  { code: "es", flag: "\u{1F1EA}\u{1F1F8}", label: "ES" },
  { code: "nl", flag: "\u{1F1F3}\u{1F1F1}", label: "NL" },
  { code: "de", flag: "\u{1F1E9}\u{1F1EA}", label: "DE" },
  { code: "it", flag: "\u{1F1EE}\u{1F1F9}", label: "IT" },
  { code: "ln", flag: "\u{1F1E8}\u{1F1E9}", label: "LN" },
];

// ══════════════════════════════════════════════════════════
// LANGUAGE SELECTOR
// ══════════════════════════════════════════════════════════

function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALE_OPTIONS.find((l) => l.code === locale) ?? LOCALE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] transition-colors text-sm"
      >
        <span>{current.flag}</span>
        <span className="text-xs font-medium text-white/70">{current.label}</span>
        <ChevronDown size={12} className={`text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-36 rounded-xl bg-[#0A1628]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl overflow-hidden z-50"
          >
            {LOCALE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => {
                  setLocale(opt.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/[0.06] transition-colors ${
                  locale === opt.code ? "bg-white/[0.08] text-cyan-400" : "text-white/70"
                }`}
              >
                <span>{opt.flag}</span>
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ANIMATED BACKGROUND
// ══════════════════════════════════════════════════════════

function ParticleField() {
  const [particles, setParticles] = useState<
    { size: number; left: number; top: number; delay: number; duration: number; color: string }[]
  >([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 20;
    setParticles(
      Array.from({ length: count }).map((_, i) => ({
        size: 2 + Math.random() * 4,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 6,
        color: i % 3 === 0 ? "rgba(6,214,193,0.4)" : "rgba(99,102,241,0.3)",
      }))
    );
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ willChange: "transform", transform: "translateZ(0)" }}
    >
      {/* Mesh gradient orbs */}
      <div className="orb-blue w-[600px] h-[600px] top-[-200px] left-[-100px] opacity-40" />
      <div className="orb-cyan w-[400px] h-[400px] top-[20%] right-[-50px] opacity-30" />
      <div className="orb-blue w-[500px] h-[500px] bottom-[-100px] left-[30%] opacity-25" />

      {/* Grid lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }} />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// LIVE FX CALCULATOR
// ══════════════════════════════════════════════════════════

function FXCalculator() {
  const t = useT();
  const [amount, setAmount] = useState("500");
  const [fromIdx, setFromIdx] = useState(0); // EUR
  const [toIdx, setToIdx] = useState(0); // CD

  const from = SEND_COUNTRIES[fromIdx];
  const to = DESTINATION_COUNTRIES[toIdx];
  const rateKey = `${from.currency}-${to.currency}`;
  const rateData = DEMO_RATES[rateKey];
  const numAmount = parseFloat(amount) || 0;
  const received = rateData ? numAmount * rateData.rate : 0;
  const fee = Math.max(numAmount * 0.008, 0.99);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* Glass card */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-xl border border-white/[0.1]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent" />

        <div className="relative p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <ArrowLeftRight size={16} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-white/90">{t("landing.calc.title")}</span>
            </div>
            <div className="badge-cyan text-[10px]">
              <Sparkles size={10} /> {t("landing.calc.badge")}
            </div>
          </div>

          {/* You send */}
          <div>
            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">{t("landing.calc.send")}</label>
            <div className="mt-1.5 flex items-center gap-3 bg-white/[0.06] rounded-2xl p-3 border border-white/[0.08]">
              <select
                value={fromIdx}
                onChange={(e) => setFromIdx(Number(e.target.value))}
                className="bg-transparent text-white font-semibold text-sm outline-none cursor-pointer appearance-none pr-2"
              >
                {SEND_COUNTRIES.map((c, i) => (
                  <option key={c.code} value={i} className="bg-[#0A1628] text-white">
                    {c.flag} {c.currency}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-right text-2xl font-bold text-white outline-none"
                min="0"
              />
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-cyan">
              <ArrowRight size={18} className="text-white" />
            </div>
          </div>

          {/* They receive */}
          <div>
            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">{t("landing.calc.receive")}</label>
            <div className="mt-1.5 flex items-center gap-3 bg-white/[0.06] rounded-2xl p-3 border border-white/[0.08]">
              <select
                value={toIdx}
                onChange={(e) => setToIdx(Number(e.target.value))}
                className="bg-transparent text-white font-semibold text-sm outline-none cursor-pointer appearance-none pr-2"
              >
                {DESTINATION_COUNTRIES.map((c, i) => (
                  <option key={c.code} value={i} className="bg-[#0A1628] text-white">
                    {c.flag} {c.currency}
                  </option>
                ))}
              </select>
              <div className="flex-1 text-right">
                <span className="text-2xl font-bold text-gradient-cyan">
                  {received.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Rate info */}
          <div className="flex items-center justify-between text-xs text-white/50 px-1">
            <span>{t("landing.calc.rate")}: 1 {from.currency} = {rateData?.rate.toLocaleString("fr-FR")} {to.currency}</span>
            <span>{t("landing.calc.fee")}: {fee.toFixed(2)} {from.currency}</span>
          </div>

          {/* CTA */}
          <Link href="/register" className="btn-primary w-full text-center">
            {t("landing.calc.cta")} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════
// CORRIDOR TICKER
// ══════════════════════════════════════════════════════════

function CorridorTicker() {
  const corridors = CORRIDORS.slice(0, 8);

  return (
    <div className="overflow-hidden py-4">
      <motion.div
        animate={{ x: [0, -1200] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-4 whitespace-nowrap"
      >
        {[...corridors, ...corridors].map((c, i) => (
          <div key={`${c.id}-${i}`} className="corridor-pill shrink-0">
            <span className="text-base">{c.fromFlag}</span>
            <ArrowRight size={12} />
            <span className="text-base">{c.toFlag}</span>
            <span className="text-xs opacity-70">{c.fromCurrency} → {c.toCurrency}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// FEATURE CARDS
// ══════════════════════════════════════════════════════════

function getFeatures(t: (key: string) => string) {
  return [
    { iconName: "zap", title: t("landing.feat.instant"), desc: t("landing.feat.instant_desc"), gradient: "from-yellow-500 to-orange-500" },
    { iconName: "trending", title: t("landing.feat.fees"), desc: t("landing.feat.fees_desc"), gradient: "from-green-500 to-emerald-500" },
    { iconName: "bot", title: t("landing.feat.ai"), desc: t("landing.feat.ai_desc"), gradient: "from-violet-500 to-purple-500" },
    { iconName: "shield", title: t("landing.feat.secure"), desc: t("landing.feat.secure_desc"), gradient: "from-blue-500 to-cyan-500" },
    { iconName: "phone", title: t("landing.feat.mobile"), desc: t("landing.feat.mobile_desc"), gradient: "from-pink-500 to-rose-500" },
    { iconName: "globe", title: t("landing.feat.diaspora"), desc: t("landing.feat.diaspora_desc"), gradient: "from-cyan-500 to-teal-500" },
  ];
}

function FeatureIcon({ name }: { name: string }) {
  switch (name) {
    case "zap": return <Zap size={24} />;
    case "trending": return <TrendingDown size={24} />;
    case "bot": return <Bot size={24} />;
    case "shield": return <Shield size={24} />;
    case "phone": return <Smartphone size={24} />;
    case "globe": return <Globe size={24} />;
    default: return null;
  }
}

function FeatureCard({ feature, index }: { feature: { iconName: string; title: string; desc: string; gradient: string }; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      <div className="relative rounded-2xl overflow-hidden h-full">
        <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

        <div className="relative p-6 space-y-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg`}>
            <FeatureIcon name={feature.iconName} />
          </div>
          <h3 className="text-lg font-bold text-white">{feature.title}</h3>
          <p className="text-sm text-white/60 leading-relaxed">{feature.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════
// HOW IT WORKS
// ══════════════════════════════════════════════════════════

function getSteps(t: (key: string) => string) {
  return [
    { num: "01", title: t("landing.how.step1"), desc: t("landing.how.step1_desc"), iconName: "users" as const },
    { num: "02", title: t("landing.how.step2"), desc: t("landing.how.step2_desc"), iconName: "send" as const },
    { num: "03", title: t("landing.how.step3"), desc: t("landing.how.step3_desc"), iconName: "card" as const },
    { num: "04", title: t("landing.how.step4"), desc: t("landing.how.step4_desc"), iconName: "zap" as const },
  ];
}

function StepIcon({ name }: { name: string }) {
  switch (name) {
    case "users": return <Users size={20} />;
    case "send": return <Send size={20} />;
    case "card": return <CreditCard size={20} />;
    case "zap": return <Zap size={20} />;
    default: return null;
  }
}

// ══════════════════════════════════════════════════════════
// TESTIMONIALS (kept in French — user quotes, not translatable UI)
// ══════════════════════════════════════════════════════════

const TESTIMONIALS = [
  { name: "Patrick M.", country: "\u{1F1E7}\u{1F1EA} Bruxelles \u2192 \u{1F1E8}\u{1F1E9} Kinshasa", text: "Ma m\u00e8re re\u00e7oit l'argent sur M-Pesa en 3 minutes. Avant avec Western Union c'\u00e9tait 2 jours et 3x plus cher.", stars: 5 },
  { name: "Ana S.", country: "\u{1F1F5}\u{1F1F9} Lisbonne \u2192 \u{1F1E6}\u{1F1F4} Luanda", text: "Enfin une app qui comprend la diaspora angolaise. Multicaixa Express est instantan\u00e9 et les frais sont minimes.", stars: 5 },
  { name: "Jean-Claude K.", country: "\u{1F1EB}\u{1F1F7} Paris \u2192 \u{1F1E8}\u{1F1E9} Lubumbashi", text: "L'assistant IA m'a conseill\u00e9 d'attendre un jour pour un meilleur taux. J'ai \u00e9conomis\u00e9 40\u20ac sur mon envoi.", stars: 5 },
  { name: "Sofia R.", country: "\u{1F1E8}\u{1F1ED} Gen\u00e8ve \u2192 \u{1F1E6}\u{1F1F4} Benguela", text: "Interface moderne, taux transparents, support en portugais. Exactement ce qu'il manquait.", stars: 5 },
];

// ══════════════════════════════════════════════════════════
// FAQ (kept in French for now — keys to be added to translations later)
// ══════════════════════════════════════════════════════════

const FAQ = [
  {
    q: "Vers quels pays puis-je envoyer de l'argent ?",
    a: "Tinda Cash est sp\u00e9cialis\u00e9 dans les transferts vers le Congo RDC et l'Angola. Vous pouvez envoyer depuis la France, Belgique, Suisse, UK, Allemagne, Portugal, Canada, USA et Br\u00e9sil.",
  },
  {
    q: "Quels sont les modes de r\u00e9ception disponibles ?",
    a: "Congo RDC: M-Pesa (Vodacom), Airtel Money, Orange Money, virement bancaire. Angola: Multicaixa Express, Unitel Money, virement bancaire, retrait en agence.",
  },
  {
    q: "Combien de temps prend un transfert ?",
    a: "Les transferts mobile money arrivent en moins de 5 minutes (RDC) ou 10 minutes (Angola). Les virements bancaires prennent 1-2 jours ouvr\u00e9s.",
  },
  {
    q: "Quels sont vos frais ?",
    a: "Nos frais sont de 0.5% \u00e0 1.5% selon le montant, avec un minimum de 0.99\u20ac. C'est jusqu'\u00e0 80% moins cher que les services traditionnels.",
  },
  {
    q: "Comment fonctionne l'IA multi-agent ?",
    a: "Notre syst\u00e8me IA comprend 4 agents sp\u00e9cialis\u00e9s : un conseiller de change qui optimise vos taux, un agent compliance pour le KYC, un assistant transfert et un support client. Ils travaillent ensemble pour vous offrir la meilleure exp\u00e9rience.",
  },
  {
    q: "Mon argent est-il prot\u00e9g\u00e9 ?",
    a: "Oui. Tinda Cash s\u2019appuie sur des partenaires enti\u00e8rement r\u00e9glement\u00e9s : Flutterwave (agr\u00e9\u00e9 CBN au Nig\u00e9ria), Wise (autoris\u00e9 FCA au Royaume-Uni) et Airwallex (r\u00e9gul\u00e9 en Europe). Vos fonds sont s\u00e9gr\u00e9gu\u00e9s, couverts par les m\u00e9canismes de protection en vigueur, et toutes les donn\u00e9es sont chiffr\u00e9es en AES-256. Nous ne touchons jamais directement \u00e0 vos fonds : ce sont nos partenaires licenci\u00e9s qui les d\u00e9tiennent.",
  },
  {
    q: "Comment v\u00e9rifiez-vous mon identit\u00e9 ?",
    a: "La v\u00e9rification d\u2019identit\u00e9 (KYC) est assur\u00e9e par Onfido, leader mondial certifi\u00e9 ISO 27001 et enregistr\u00e9 aupr\u00e8s de l\u2019ICO (RGPD). Le processus prend moins de 3 minutes : photo de votre pi\u00e8ce d\u2019identit\u00e9 + selfie. L\u2019IA d\u2019Onfido v\u00e9rifie l\u2019authenticit\u00e9 du document et confirme que vous \u00eates bien la personne sur la photo. Vos donn\u00e9es biom\u00e9triques ne sont pas conserv\u00e9es apr\u00e8s validation.",
  },
];

function FAQItem({ item, isOpen, toggle }: { item: { q: string; a: string }; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-white/[0.06]">
      <button onClick={toggle} className="w-full py-5 flex items-center justify-between text-left group">
        <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors pr-4">{item.q}</span>
        <ChevronDown size={18} className={`text-white/40 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-white/50 leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════

export default function LandingPage() {
  const t = useT();
  const [mobileNav, setMobileNav] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const FEATURES = getFeatures(t);
  const STEPS = getSteps(t);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050A18] text-white overflow-x-hidden">
      <ParticleField />

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#050A18]/80 backdrop-blur-xl border-b border-white/[0.06]" : ""}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-cyan">
              <Send size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Tinda Cash</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: t("landing.features.title"), href: "#features" },
              { label: t("landing.corridors"), href: "#corridors" },
              { label: t("landing.pricing.title"), href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2">
              {t("landing.hero.login")}
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2.5 px-5">
              {t("landing.hero.cta")} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <button onClick={() => setMobileNav(!mobileNav)} className="text-white/70">
              {mobileNav ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#050A18]/95 backdrop-blur-xl border-t border-white/[0.06] overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {[
                  { label: t("landing.features.title"), href: "#features" },
                  { label: t("landing.corridors"), href: "#corridors" },
                  { label: t("landing.pricing.title"), href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                ].map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setMobileNav(false)} className="block py-2 text-sm text-white/60 hover:text-white transition-colors">{l.label}</a>
                ))}
                <Link href="/login" className="block py-2 text-sm text-white/70">{t("landing.hero.login")}</Link>
                <Link href="/register" className="btn-primary w-full text-center text-sm">{t("landing.hero.cta")}</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6">
        {/* Animated gradient orb behind hero */}
        <div
          className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.6) 0%, rgba(6,182,212,0.3) 50%, transparent 75%)",
            filter: "blur(60px)",
            animation: "pulse 6s ease-in-out infinite",
          }}
        />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs font-medium text-cyan-400 mb-6">
                  <Bot size={14} /> {t("landing.badge.ai")}
                </div>

                <h1 className="display-hero">
                  {t("landing.hero.title1")}{" "}
                  <span className="text-gradient-cyan">Congo RDC</span>,{" "}
                  <span className="text-gradient-cyan">Congo-Brazza</span>{" "}
                  & <span className="text-gradient-cyan">Angola</span>{" "}
                  {t("landing.hero.title2")}
                </h1>

                <p className="mt-6 text-lg text-white/50 leading-relaxed max-w-lg">
                  {t("landing.hero.subtitle")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/register" className="btn-primary text-base py-4 px-8">
                  {t("landing.hero.cta")} <ArrowRight size={18} />
                </Link>
                <a href="#features" className="btn-secondary bg-transparent border-white/[0.12] text-white/80 hover:text-white hover:border-white/[0.25] text-base py-4 px-8">
                  {t("landing.features.title")}
                </a>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-6 pt-4"
              >
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Lock size={14} className="text-green-500" /> {t("landing.badge.encryption")}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Shield size={14} className="text-blue-400" /> {t("landing.badge.gdpr")}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Cpu size={14} className="text-violet-400" /> {t("landing.badge.ai")}
                </div>
              </motion.div>

              {/* Partner logos strip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-2"
              >
                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3">{"Propuls\u00e9 par"}</p>
                <div className="flex flex-wrap items-center gap-4">
                  {[
                    { name: "Wise", color: "text-emerald-400" },
                    { name: "Flutterwave", color: "text-orange-400" },
                    { name: "Airwallex", color: "text-blue-400" },
                    { name: "Onfido", color: "text-violet-400" },
                  ].map((p) => (
                    <span
                      key={p.name}
                      className={`text-xs font-bold ${p.color} opacity-60 hover:opacity-100 transition-opacity`}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right — Calculator */}
            <FXCalculator />
          </div>
        </div>
      </section>

      {/* ─── CORRIDOR TICKER ─── */}
      <section className="border-y border-white/[0.04] bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4">
          <CorridorTicker />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "< 5 min", label: t("landing.calc.delivery") },
            { value: "0.5%", label: t("landing.calc.fee") },
            { value: "13", label: t("landing.corridors") },
            { value: "24/7", label: t("landing.badge.ai") },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-gradient-cyan">{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="eyebrow">{t("landing.features.title")}</span>
            <h2 className="display-title text-white mt-4">
              {t("landing.features.subtitle")}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.iconName} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="corridors" className="py-20 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.03] to-transparent" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="eyebrow">{t("landing.how.title")}</span>
            <h2 className="display-title text-white mt-4">{t("landing.how.subtitle")}</h2>
          </motion.div>

          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-5 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:border-cyan-500/40 transition-colors">
                  <StepIcon name={step.iconName} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-cyan-500/60">{step.num}</span>
                    <h3 className="font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-sm text-white/50">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI SECTION ─── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-cyan-500/10" />
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-3xl" />

            <div className="relative p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-400">
                  <Sparkles size={12} /> Technologie exclusive
                </div>
                <h2 className="display-title text-white">
                  4 agents IA travaillent pour vous
                </h2>
                <p className="text-white/50 leading-relaxed">
                  Notre syst&egrave;me multi-agent propuls&eacute; par Claude analyse chaque transfert en temps r&eacute;el
                  pour optimiser vos taux, v&eacute;rifier la conformit&eacute; et r&eacute;soudre tout probl&egrave;me instantan&eacute;ment.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: "\u{1F4CA}", name: "Conseiller Change", desc: "Analyse les tendances et recommande le meilleur moment pour envoyer", color: "from-yellow-500/20 to-orange-500/10" },
                  { icon: "\u{1F6E1}\u{FE0F}", name: "Agent Compliance", desc: "V\u00e9rifie automatiquement KYC/AML et ajuste les limites", color: "from-blue-500/20 to-cyan-500/10" },
                  { icon: "\u{1F4B8}", name: "Assistant Transfert", desc: "Guide pas \u00e0 pas et optimise le routage du paiement", color: "from-green-500/20 to-emerald-500/10" },
                  { icon: "\u{1F4AC}", name: "Support IA", desc: "Disponible 24/7 en fran\u00e7ais, portugais et lingala", color: "from-pink-500/20 to-rose-500/10" },
                ].map((agent, i) => (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${agent.color} border border-white/[0.06]`}
                  >
                    <span className="text-2xl">{agent.icon}</span>
                    <div>
                      <div className="font-semibold text-sm text-white">{agent.name}</div>
                      <div className="text-xs text-white/40">{agent.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST & COMPLIANCE ─── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Animated glow border */}
            <div
              className="absolute -inset-[1px] rounded-3xl opacity-60"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.6), rgba(6,182,212,0.4), rgba(99,102,241,0.2), rgba(6,182,212,0.5))",
                backgroundSize: "300% 300%",
                animation: "gradientShift 6s ease infinite",
              }}
            />
            <div className="relative rounded-3xl bg-[#0A1020] border border-white/[0.06] p-8 md:p-12">
              <div className="text-center mb-10">
                <p className="text-[11px] uppercase tracking-widest text-indigo-400 font-semibold mb-2">
                  {"S\u00e9curit\u00e9 & R\u00e9glementation"}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {"Propuls\u00e9 par des partenaires r\u00e9glement\u00e9s"}
                </h2>
                <p className="mt-3 text-sm text-white/40 max-w-lg mx-auto">
                  {"Tinda Cash est une plateforme technologique adoss\u00e9e \u00e0 des prestataires de services financiers enti\u00e8rement licenci\u00e9s et r\u00e9glement\u00e9s."}
                </p>
              </div>

              {/* Partner logos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                  { name: "Flutterwave", sub: "CBN Licensed · Nigeria", color: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/20", text: "text-orange-400" },
                  { name: "Wise", sub: "FCA Authorized · UK", color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-400" },
                  { name: "Onfido", sub: "ICO Registered · GDPR", color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/20", text: "text-violet-400" },
                  { name: "Airwallex", sub: "Multi-currency Wallet", color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/20", text: "text-blue-400" },
                ].map((partner) => (
                  <div
                    key={partner.name}
                    className={`rounded-2xl bg-gradient-to-br ${partner.color} border ${partner.border} p-4 text-center`}
                  >
                    <div className={`text-base font-bold ${partner.text} mb-1`}>{partner.name}</div>
                    <div className="text-[10px] text-white/30">{partner.sub}</div>
                  </div>
                ))}
              </div>

              {/* Security badges */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: <Shield size={14} />, label: "PCI DSS", color: "text-green-400 border-green-500/30 bg-green-500/10" },
                  { icon: <Lock size={14} />, label: "AES-256", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
                  { icon: <CheckCircle2 size={14} />, label: "GDPR Compliant", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
                  { icon: <Cpu size={14} />, label: "2FA Auth", color: "text-violet-400 border-violet-500/30 bg-violet-500/10" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold ${badge.color}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="eyebrow">{t("landing.pricing.title")}</span>
            <h2 className="display-title text-white mt-4">{t("landing.pricing.subtitle")}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl" />
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left p-4 font-semibold text-white/60">{t("landing.pricing.provider")}</th>
                    <th className="p-4 font-semibold text-white/60">{t("landing.pricing.fee")}</th>
                    <th className="p-4 font-semibold text-white/60">{t("landing.calc.receive")} (USD)</th>
                    <th className="p-4 font-semibold text-white/60">{t("landing.pricing.speed")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/[0.06] bg-cyan-500/[0.05]">
                    <td className="p-4 font-bold text-cyan-400">Tinda Cash ✨</td>
                    <td className="p-4 text-center text-cyan-400 font-bold">4.00€</td>
                    <td className="p-4 text-center font-semibold text-white">535 $</td>
                    <td className="p-4 text-center text-cyan-400">{"< 5 min"}</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="p-4 text-white/60">Western Union</td>
                    <td className="p-4 text-center text-white/40">32.50€</td>
                    <td className="p-4 text-center text-white/40">498 $</td>
                    <td className="p-4 text-center text-white/40">1-2 jours</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="p-4 text-white/60">MoneyGram</td>
                    <td className="p-4 text-center text-white/40">25.00€</td>
                    <td className="p-4 text-center text-white/40">505 $</td>
                    <td className="p-4 text-center text-white/40">1-3 jours</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-white/60">WorldRemit</td>
                    <td className="p-4 text-center text-white/40">9.99€</td>
                    <td className="p-4 text-center text-white/40">520 $</td>
                    <td className="p-4 text-center text-white/40">{"< 30 min"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="eyebrow">{t("landing.testimonials.title")}</span>
            <h2 className="display-title text-white mt-4">{t("landing.testimonials.title")}</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl" />
                <div className="relative p-5 space-y-3">
                  <div className="flex gap-0.5">
                    {Array(testimonial.stars).fill(0).map((_, j) => (
                      <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{testimonial.text}</p>
                  <div>
                    <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                    <div className="text-[10px] text-white/40">{testimonial.country}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="eyebrow">FAQ</span>
            <h2 className="display-title text-white mt-4">{t("landing.faq.title")}</h2>
          </motion.div>

          <div>
            {FAQ.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={faqOpen === i}
                toggle={() => setFaqOpen(faqOpen === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Social proof stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              {[
                { value: "50\u202f000+", label: "utilisateurs actifs" },
                { value: "2\u202fM+ EUR", label: "transf\u00e9r\u00e9s" },
                { value: "4.8/5", label: "sur Trustpilot" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="text-3xl font-extrabold"
                    style={{ background: "linear-gradient(135deg, #6366F1, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <h2
              className="display-title mb-6"
              style={{ background: "linear-gradient(135deg, #fff 30%, #6366F1 70%, #06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              {t("landing.cta.title")}
            </h2>
            <p className="text-white/50 mb-10 max-w-md mx-auto">
              {t("landing.cta.subtitle")}
            </p>
            <Link href="/register" className="btn-primary text-lg py-5 px-10">
              {t("landing.cta.button")} <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Send size={14} className="text-white" />
                </div>
                <span className="font-bold">Tinda Cash</span>
              </div>
              <p className="text-sm text-white/40 max-w-xs leading-relaxed">
                {t("landing.hero.subtitle")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white/70 mb-3">{t("landing.features.title")}</h4>
              <div className="space-y-2 text-sm text-white/40">
                <a href="#features" className="block hover:text-white/60">{t("landing.features.title")}</a>
                <a href="#pricing" className="block hover:text-white/60">{t("landing.pricing.title")}</a>
                <a href="#faq" className="block hover:text-white/60">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white/70 mb-3">{t("landing.corridors")}</h4>
              <div className="space-y-2 text-sm text-white/40">
                <span className="block">{"\u{1F1E8}\u{1F1E9}"} Congo RDC</span>
                <span className="block">{"\u{1F1E6}\u{1F1F4}"} Angola</span>
              </div>
            </div>
          </div>

          {/* Regulatory notice */}
          <div className="border-t border-white/[0.06] pt-6 mb-4">
            <p className="text-[10px] text-white/20 leading-relaxed max-w-3xl">
              {"Tinda Cash est une plateforme technologique qui connecte des prestataires de services financiers r\u00e9glement\u00e9s. Les transferts sont ex\u00e9cut\u00e9s par nos partenaires licenci\u00e9s\u00a0:"}{" "}
              <span className="text-white/35">Flutterwave</span>
              {" (agr\u00e9\u00e9 CBN, Nig\u00e9ria), "}
              <span className="text-white/35">Wise Payments Ltd</span>
              {" (autoris\u00e9 FCA, Royaume-Uni, r\u00e9f.\u00a0900507), "}
              <span className="text-white/35">Onfido</span>
              {" (enregistr\u00e9 ICO, RGPD). Tinda Cash ne d\u00e9tient pas de fonds et n\u2019est pas un \u00e9tablissement de paiement. Contact\u00a0:"}{" "}
              <a href="mailto:support@tindacash.com" className="text-indigo-400/70 hover:text-indigo-400 transition-colors">support@tindacash.com</a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-white/30">&copy; {new Date().getFullYear()} Tinda Cash. {t("landing.footer.rights")}</span>
            <div className="flex gap-4 text-xs text-white/30">
              <a href="#" className="hover:text-white/50">{t("landing.footer.terms")}</a>
              <a href="#" className="hover:text-white/50">{t("landing.footer.privacy")}</a>
              <a href="#" className="hover:text-white/50">{t("landing.footer.legal")}</a>
              <a href="mailto:support@tindacash.com" className="hover:text-white/50">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
