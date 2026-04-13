/**
 * Airwallex Integration
 * Multi-currency wallet: EUR + USD + CHF
 * Used for: holding funds, FX conversion, balance management
 * Docs: https://www.airwallex.com/docs/api
 */

const BASE_URL = process.env.AIRWALLEX_ENV === "production"
  ? "https://api.airwallex.com"
  : "https://api-demo.airwallex.com";

const CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID!;
const API_KEY = process.env.AIRWALLEX_API_KEY!;

// Token cache (in-memory, per serverless instance)
let tokenCache: { token: string; expiresAt: number } | null = null;

// ─────────────────────────────────────────────
// Authentication (Bearer token via client credentials)
// ─────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  // Reuse cached token if still valid (with 60s buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const res = await fetch(`${BASE_URL}/api/v1/authentication/login`, {
    method: "POST",
    headers: {
      "x-client-id": CLIENT_ID,
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();

  if (!res.ok || !json.token) {
    throw new Error(`Airwallex auth failed: ${json.message || res.statusText}`);
  }

  tokenCache = {
    token: json.token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  return json.token;
}

// ─────────────────────────────────────────────
// HTTP helper
// ─────────────────────────────────────────────

async function ax<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  queryParams?: Record<string, string>
): Promise<T> {
  const token = await getAccessToken();
  const url = new URL(`${BASE_URL}${path}`);

  if (queryParams) {
    Object.entries(queryParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      `Airwallex error ${res.status}: ${json.message || JSON.stringify(json)}`
    );
  }

  return json;
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AirwallexBalance {
  currency: string;
  total_amount: number;
  available_amount: number;
  pending_amount: number;
}

export interface AirwallexFxQuote {
  quote_id: string;
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  rate: number;
  expires_at: string;
}

export interface AirwallexConversion {
  conversion_id: string;
  status: "PENDING" | "SETTLED" | "FAILED";
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  rate: number;
  created_at: string;
}

export interface AirwallexPayment {
  payment_id: string;
  source_currency: string;
  source_amount: number;
  destination_currency: string;
  destination_amount: number;
  status: "INITIATED" | "PROCESSING" | "SUCCESS" | "FAILED";
  beneficiary_name: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// Balances
// ─────────────────────────────────────────────

export async function getBalances(): Promise<AirwallexBalance[]> {
  const res = await ax<{ items: AirwallexBalance[] }>(
    "GET",
    "/api/v1/balances"
  );
  return res.items;
}

export async function getBalance(currency: "EUR" | "USD" | "CHF"): Promise<AirwallexBalance | null> {
  const balances = await getBalances();
  return balances.find((b) => b.currency === currency) ?? null;
}

// ─────────────────────────────────────────────
// FX Quotes
// ─────────────────────────────────────────────

export async function getFxQuote(params: {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  lockSide?: "SOURCE" | "DESTINATION";
}): Promise<AirwallexFxQuote> {
  return ax<AirwallexFxQuote>("POST", "/api/v1/fx/quotes", {
    sell_currency: params.fromCurrency,
    buy_currency: params.toCurrency,
    [params.lockSide === "DESTINATION" ? "buy_amount" : "sell_amount"]: params.amount,
    quote_lock_duration: 60, // 60 second quote validity
  });
}

// ─────────────────────────────────────────────
// FX Conversions (wallet → wallet)
// ─────────────────────────────────────────────

export async function convertCurrency(params: {
  quoteId: string;
  requestId: string; // idempotency key
}): Promise<AirwallexConversion> {
  return ax<AirwallexConversion>("POST", "/api/v1/fx/conversions", {
    quote_id: params.quoteId,
    request_id: params.requestId,
  });
}

// ─────────────────────────────────────────────
// Outbound payments (pay beneficiary from wallet)
// ─────────────────────────────────────────────

export interface CreatePaymentParams {
  requestId: string;          // idempotency key
  currency: string;
  amount: number;
  beneficiary: {
    name: string;
    bankDetails: {
      accountName: string;
      bankCountryCode: string;
      localClearingSystem?: string;
      accountNumber?: string;
      bic?: string;          // BIC/SWIFT
      iban?: string;
      sortCode?: string;     // UK
    };
  };
  reference?: string;
  purposeCode?: string;      // "FAMILY_SUPPORT" | "PERSONAL_REMITTANCE"
}

export async function createPayment(
  params: CreatePaymentParams
): Promise<AirwallexPayment> {
  return ax<AirwallexPayment>("POST", "/api/v1/payments/create", {
    request_id: params.requestId,
    currency: params.currency,
    amount: params.amount,
    payment_method: "LOCAL",
    beneficiary: {
      name: params.beneficiary.name,
      bank_details: {
        account_name: params.beneficiary.bankDetails.accountName,
        bank_country_code: params.beneficiary.bankDetails.bankCountryCode,
        ...(params.beneficiary.bankDetails.iban && {
          account_routing_type1: "IBAN",
          account_routing_value1: params.beneficiary.bankDetails.iban,
        }),
        ...(params.beneficiary.bankDetails.bic && {
          bic_swift: params.beneficiary.bankDetails.bic,
        }),
        ...(params.beneficiary.bankDetails.sortCode && {
          account_routing_type1: "SORT_CODE",
          account_routing_value1: params.beneficiary.bankDetails.sortCode,
          account_routing_type2: "ACCOUNT_NUMBER",
          account_routing_value2:
            params.beneficiary.bankDetails.accountNumber,
        }),
      },
    },
    source_of_funds: "BUSINESS_ACCOUNT",
    payment_date: new Date().toISOString().split("T")[0],
    remittance_info: params.reference || "Tinda Cash Transfer",
    purpose_code: params.purposeCode || "PERSONAL_REMITTANCE",
  });
}

export async function getPaymentStatus(
  paymentId: string
): Promise<AirwallexPayment> {
  return ax<AirwallexPayment>("GET", `/api/v1/payments/${paymentId}`);
}
