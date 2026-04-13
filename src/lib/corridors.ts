import type { TransferDirection } from "./types";

export interface Corridor {
  id: string;
  fromCountry: string;
  fromCountryCode: string;
  fromFlag: string;
  fromCurrency: string;
  fromCurrencySymbol: string;
  toCountry: string;
  toCountryCode: string;
  toFlag: string;
  toCurrency: string;
  toCurrencySymbol: string;
  paymentMethods: string[];
  receiveMethod: string;
  estimatedTime: string;
  available: boolean;
  priority: "P0";
  region: "central_africa";
}

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  dialCode?: string;
  region?: string;
}

export interface ReceiveCountryInfo extends CountryInfo {
  method: string;
}

// ═══════════════════════════════════════════════════════════════
// CORRIDORS — EXCLUSIF ANGOLA + CONGO RDC
// Europe → Angola & Congo RDC (diaspora envoie au pays)
// ═══════════════════════════════════════════════════════════════

export const CORRIDORS: Corridor[] = [
  // ──────────────────────────────────────────────────
  // CONGO RDC (🇨🇩) — Mobile Money (M-Pesa, Airtel, Orange)
  // Devise reçue : USD ou CDF
  // ──────────────────────────────────────────────────
  {
    id: "FR-CD",
    fromCountry: "France", fromCountryCode: "FR", fromFlag: "🇫🇷",
    fromCurrency: "EUR", fromCurrencySymbol: "€",
    toCountry: "Congo RDC", toCountryCode: "CD", toFlag: "🇨🇩",
    toCurrency: "USD", toCurrencySymbol: "$",
    paymentMethods: ["Carte bancaire", "Virement SEPA", "Apple Pay"],
    receiveMethod: "M-Pesa / Airtel Money / Orange Money",
    estimatedTime: "< 5 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "BE-CD",
    fromCountry: "Belgique", fromCountryCode: "BE", fromFlag: "🇧🇪",
    fromCurrency: "EUR", fromCurrencySymbol: "€",
    toCountry: "Congo RDC", toCountryCode: "CD", toFlag: "🇨🇩",
    toCurrency: "CDF", toCurrencySymbol: "FC",
    paymentMethods: ["Carte bancaire", "Virement SEPA", "Apple Pay"],
    receiveMethod: "M-Pesa / Orange Money / Airtel Money",
    estimatedTime: "< 5 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "CH-CD",
    fromCountry: "Suisse", fromCountryCode: "CH", fromFlag: "🇨🇭",
    fromCurrency: "CHF", fromCurrencySymbol: "CHF",
    toCountry: "Congo RDC", toCountryCode: "CD", toFlag: "🇨🇩",
    toCurrency: "USD", toCurrencySymbol: "$",
    paymentMethods: ["Virement SEPA", "Carte bancaire"],
    receiveMethod: "M-Pesa / Airtel Money / Orange Money",
    estimatedTime: "< 5 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "GB-CD",
    fromCountry: "Royaume-Uni", fromCountryCode: "GB", fromFlag: "🇬🇧",
    fromCurrency: "GBP", fromCurrencySymbol: "£",
    toCountry: "Congo RDC", toCountryCode: "CD", toFlag: "🇨🇩",
    toCurrency: "USD", toCurrencySymbol: "$",
    paymentMethods: ["Carte bancaire", "Virement FPS"],
    receiveMethod: "M-Pesa / Airtel Money",
    estimatedTime: "< 5 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "DE-CD",
    fromCountry: "Allemagne", fromCountryCode: "DE", fromFlag: "🇩🇪",
    fromCurrency: "EUR", fromCurrencySymbol: "€",
    toCountry: "Congo RDC", toCountryCode: "CD", toFlag: "🇨🇩",
    toCurrency: "USD", toCurrencySymbol: "$",
    paymentMethods: ["Carte bancaire", "Virement SEPA"],
    receiveMethod: "M-Pesa / Airtel Money / Orange Money",
    estimatedTime: "< 5 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "CA-CD",
    fromCountry: "Canada", fromCountryCode: "CA", fromFlag: "🇨🇦",
    fromCurrency: "CAD", fromCurrencySymbol: "C$",
    toCountry: "Congo RDC", toCountryCode: "CD", toFlag: "🇨🇩",
    toCurrency: "USD", toCurrencySymbol: "$",
    paymentMethods: ["Carte bancaire", "Interac"],
    receiveMethod: "M-Pesa / Airtel Money",
    estimatedTime: "< 10 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "US-CD",
    fromCountry: "États-Unis", fromCountryCode: "US", fromFlag: "🇺🇸",
    fromCurrency: "USD", fromCurrencySymbol: "$",
    toCountry: "Congo RDC", toCountryCode: "CD", toFlag: "🇨🇩",
    toCurrency: "USD", toCurrencySymbol: "$",
    paymentMethods: ["Carte bancaire", "ACH"],
    receiveMethod: "M-Pesa / Airtel Money / Orange Money",
    estimatedTime: "< 10 min", available: true, priority: "P0", region: "central_africa",
  },

  // ──────────────────────────────────────────────────
  // CONGO-BRAZZAVILLE (🇨🇬) — Airtel Money / MTN MoMo
  // Devise reçue : XAF (Franc CFA CEMAC)
  // ──────────────────────────────────────────────────
  {
    id: "FR-CG",
    fromCountry: "France", fromCountryCode: "FR", fromFlag: "🇫🇷",
    fromCurrency: "EUR", fromCurrencySymbol: "€",
    toCountry: "Congo-Brazzaville", toCountryCode: "CG", toFlag: "🇨🇬",
    toCurrency: "XAF", toCurrencySymbol: "CFA",
    paymentMethods: ["Carte bancaire", "Virement SEPA"],
    receiveMethod: "Airtel Money / MTN MoMo",
    estimatedTime: "< 5 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "CH-CG",
    fromCountry: "Suisse", fromCountryCode: "CH", fromFlag: "🇨🇭",
    fromCurrency: "CHF", fromCurrencySymbol: "CHF",
    toCountry: "Congo-Brazzaville", toCountryCode: "CG", toFlag: "🇨🇬",
    toCurrency: "XAF", toCurrencySymbol: "CFA",
    paymentMethods: ["Virement SEPA", "Carte bancaire"],
    receiveMethod: "Airtel Money / MTN MoMo",
    estimatedTime: "< 5 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "BE-CG",
    fromCountry: "Belgique", fromCountryCode: "BE", fromFlag: "🇧🇪",
    fromCurrency: "EUR", fromCurrencySymbol: "€",
    toCountry: "Congo-Brazzaville", toCountryCode: "CG", toFlag: "🇨🇬",
    toCurrency: "XAF", toCurrencySymbol: "CFA",
    paymentMethods: ["Carte bancaire", "Virement SEPA"],
    receiveMethod: "Airtel Money / MTN MoMo",
    estimatedTime: "< 5 min", available: true, priority: "P0", region: "central_africa",
  },

  // ──────────────────────────────────────────────────
  // ANGOLA (🇦🇴) — Multicaixa Express / Unitel Money / Banque
  // Devise reçue : AOA (Kwanza)
  // ──────────────────────────────────────────────────
  {
    id: "PT-AO",
    fromCountry: "Portugal", fromCountryCode: "PT", fromFlag: "🇵🇹",
    fromCurrency: "EUR", fromCurrencySymbol: "€",
    toCountry: "Angola", toCountryCode: "AO", toFlag: "🇦🇴",
    toCurrency: "AOA", toCurrencySymbol: "Kz",
    paymentMethods: ["Carte bancaire", "Virement SEPA", "MB WAY"],
    receiveMethod: "Multicaixa Express / Unitel Money / Banque",
    estimatedTime: "< 10 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "FR-AO",
    fromCountry: "France", fromCountryCode: "FR", fromFlag: "🇫🇷",
    fromCurrency: "EUR", fromCurrencySymbol: "€",
    toCountry: "Angola", toCountryCode: "AO", toFlag: "🇦🇴",
    toCurrency: "AOA", toCurrencySymbol: "Kz",
    paymentMethods: ["Carte bancaire", "Virement SEPA"],
    receiveMethod: "Multicaixa Express / Banque",
    estimatedTime: "< 10 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "CH-AO",
    fromCountry: "Suisse", fromCountryCode: "CH", fromFlag: "🇨🇭",
    fromCurrency: "CHF", fromCurrencySymbol: "CHF",
    toCountry: "Angola", toCountryCode: "AO", toFlag: "🇦🇴",
    toCurrency: "AOA", toCurrencySymbol: "Kz",
    paymentMethods: ["Virement SEPA", "Carte bancaire"],
    receiveMethod: "Multicaixa Express / Banque",
    estimatedTime: "< 10 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "GB-AO",
    fromCountry: "Royaume-Uni", fromCountryCode: "GB", fromFlag: "🇬🇧",
    fromCurrency: "GBP", fromCurrencySymbol: "£",
    toCountry: "Angola", toCountryCode: "AO", toFlag: "🇦🇴",
    toCurrency: "AOA", toCurrencySymbol: "Kz",
    paymentMethods: ["Carte bancaire", "Virement FPS"],
    receiveMethod: "Multicaixa Express / Unitel Money",
    estimatedTime: "< 10 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "BR-AO",
    fromCountry: "Brésil", fromCountryCode: "BR", fromFlag: "🇧🇷",
    fromCurrency: "BRL", fromCurrencySymbol: "R$",
    toCountry: "Angola", toCountryCode: "AO", toFlag: "🇦🇴",
    toCurrency: "AOA", toCurrencySymbol: "Kz",
    paymentMethods: ["PIX", "Carte bancaire"],
    receiveMethod: "Multicaixa Express / Banque",
    estimatedTime: "< 15 min", available: true, priority: "P0", region: "central_africa",
  },
  {
    id: "US-AO",
    fromCountry: "États-Unis", fromCountryCode: "US", fromFlag: "🇺🇸",
    fromCurrency: "USD", fromCurrencySymbol: "$",
    toCountry: "Angola", toCountryCode: "AO", toFlag: "🇦🇴",
    toCurrency: "AOA", toCurrencySymbol: "Kz",
    paymentMethods: ["Carte bancaire", "ACH"],
    receiveMethod: "Multicaixa Express / Unitel Money / Banque",
    estimatedTime: "< 10 min", available: true, priority: "P0", region: "central_africa",
  },
];

export const ACTIVE_CORRIDORS = CORRIDORS.filter((c) => c.available);
export const PRIORITY_CORRIDORS = CORRIDORS;

export function getCorridorById(id: string): Corridor | undefined {
  return CORRIDORS.find((c) => c.id === id);
}

// ─── Pays de destination (Angola + RDC) ───

export const DESTINATION_COUNTRIES: CountryInfo[] = [
  { code: "CD", name: "Congo RDC", flag: "🇨🇩", currency: "USD", symbol: "$", dialCode: "243", region: "central" },
  { code: "CG", name: "Congo-Brazzaville", flag: "🇨🇬", currency: "XAF", symbol: "CFA", dialCode: "242", region: "central" },
  { code: "AO", name: "Angola", flag: "🇦🇴", currency: "AOA", symbol: "Kz", dialCode: "244", region: "central" },
];

// ─── Pays d'envoi (Europe + Amérique) ───

export const SEND_COUNTRIES: ReceiveCountryInfo[] = [
  // ── Tier 1: 80%+ du CA ──
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", symbol: "€", method: "SEPA / Carte / Apple Pay", dialCode: "33" },
  { code: "BE", name: "Belgique", flag: "🇧🇪", currency: "EUR", symbol: "€", method: "SEPA / Bancontact / Carte", dialCode: "32" },
  { code: "CH", name: "Suisse", flag: "🇨🇭", currency: "CHF", symbol: "CHF", method: "SEPA / Carte / TWINT", dialCode: "41" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£", method: "FPS / Card / Apple Pay", dialCode: "44" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", currency: "EUR", symbol: "€", method: "SEPA / MB WAY / Carte", dialCode: "351" },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$", method: "ACH / Card / Apple Pay", dialCode: "1" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "C$", method: "Interac / Card", dialCode: "1" },
  // ── Tier 2 ──
  { code: "DE", name: "Deutschland", flag: "🇩🇪", currency: "EUR", symbol: "€", method: "SEPA / Carte", dialCode: "49" },
  { code: "BR", name: "Brasil", flag: "🇧🇷", currency: "BRL", symbol: "R$", method: "PIX / Cartao", dialCode: "55" },
  { code: "NL", name: "Nederland", flag: "🇳🇱", currency: "EUR", symbol: "€", method: "iDEAL / SEPA / Card", dialCode: "31" },
  { code: "ES", name: "Espana", flag: "🇪🇸", currency: "EUR", symbol: "€", method: "Bizum / SEPA / Tarjeta", dialCode: "34" },
  { code: "IT", name: "Italia", flag: "🇮🇹", currency: "EUR", symbol: "€", method: "SEPA / Carta", dialCode: "39" },
];

// Backward compat
export const AFRICAN_COUNTRIES = DESTINATION_COUNTRIES;
export const EUROPEAN_COUNTRIES = SEND_COUNTRIES;
export const RECEIVE_COUNTRIES = SEND_COUNTRIES;

// ─── Helpers ───

export function getCountriesForDirection(direction: TransferDirection) {
  if (direction === "africa_to_europe") {
    return { sendCountries: DESTINATION_COUNTRIES, receiveCountries: SEND_COUNTRIES };
  }
  return { sendCountries: SEND_COUNTRIES as CountryInfo[], receiveCountries: DESTINATION_COUNTRIES };
}

export function getCorridorsForDirection(direction: TransferDirection): Corridor[] {
  return ACTIVE_CORRIDORS.filter((c) => {
    if (direction === "africa_to_europe") {
      return DESTINATION_COUNTRIES.some((a) => a.code === c.fromCountryCode);
    }
    return SEND_COUNTRIES.some((e) => e.code === c.fromCountryCode);
  });
}

export function getFlagForCountry(code: string): string {
  const all = [...DESTINATION_COUNTRIES, ...SEND_COUNTRIES];
  return all.find((c) => c.code === code)?.flag ?? "🏳️";
}

export function getDeliveryMethodsForCountry(countryCode: string): string[] {
  switch (countryCode) {
    case "CD": return ["M-Pesa", "Airtel Money", "Orange Money", "Virement bancaire"];
    case "CG": return ["Airtel Money", "MTN MoMo", "Virement bancaire"];
    case "AO": return ["Multicaixa Express", "Unitel Money", "Virement bancaire", "Cash Pickup"];
    default: return ["Virement bancaire"];
  }
}

/** Exchange rate map — remplace par API live en production */
export const DEMO_RATES: Record<string, { rate: number; receiveCurrency: string }> = {
  // ─── Congo RDC (USD) ───
  "EUR-USD": { rate: 1.08, receiveCurrency: "USD" },
  "CHF-USD": { rate: 1.12, receiveCurrency: "USD" },
  "GBP-USD": { rate: 1.26, receiveCurrency: "USD" },
  "CAD-USD": { rate: 0.74, receiveCurrency: "USD" },
  "USD-USD": { rate: 1.00, receiveCurrency: "USD" },
  "BRL-USD": { rate: 0.20, receiveCurrency: "USD" },
  // ─── Congo RDC (CDF) ───
  "EUR-CDF": { rate: 2850, receiveCurrency: "CDF" },
  "CHF-CDF": { rate: 3192, receiveCurrency: "CDF" },
  "GBP-CDF": { rate: 3600, receiveCurrency: "CDF" },
  "CAD-CDF": { rate: 2109, receiveCurrency: "CDF" },
  "USD-CDF": { rate: 2639, receiveCurrency: "CDF" },
  "BRL-CDF": { rate: 528, receiveCurrency: "CDF" },
  // ─── Congo-Brazzaville (XAF) ───
  "EUR-XAF": { rate: 655.96, receiveCurrency: "XAF" },
  "CHF-XAF": { rate: 730, receiveCurrency: "XAF" },
  "GBP-XAF": { rate: 830, receiveCurrency: "XAF" },
  "USD-XAF": { rate: 607, receiveCurrency: "XAF" },
  "CAD-XAF": { rate: 449, receiveCurrency: "XAF" },
  "BRL-XAF": { rate: 121, receiveCurrency: "XAF" },
  // ─── Angola (AOA) ───
  "EUR-AOA": { rate: 980, receiveCurrency: "AOA" },
  "CHF-AOA": { rate: 1020, receiveCurrency: "AOA" },
  "GBP-AOA": { rate: 1240, receiveCurrency: "AOA" },
  "USD-AOA": { rate: 905, receiveCurrency: "AOA" },
  "BRL-AOA": { rate: 178, receiveCurrency: "AOA" },
  "CAD-AOA": { rate: 670, receiveCurrency: "AOA" },
};
