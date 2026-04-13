/**
 * Flutterwave Integration
 * Handles Africa-side payment collection (NGN, KES, XOF, GHS, MAD, etc.)
 * Docs: https://developer.flutterwave.com/docs
 */

const BASE_URL = "https://api.flutterwave.com/v3";
const SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface FlutterwaveChargeRequest {
  tx_ref: string;            // Your unique transaction reference
  amount: number;
  currency: string;          // NGN, KES, XOF, GHS, MAD
  email: string;
  phone_number: string;
  fullname: string;
  redirect_url?: string;
  client_ip?: string;
  device_fingerprint?: string;
  meta?: Record<string, string>;
}

export interface MpesaChargeRequest extends FlutterwaveChargeRequest {
  currency: "KES";
  // M-Pesa specific — no extra fields needed, Flutterwave handles the STK push
}

export interface MobileMoneyChargeRequest extends FlutterwaveChargeRequest {
  currency: "XOF" | "GHS" | "NGN";
  network?: string;  // "MTN" | "VODAFONE" | "TIGO" | "ORANGE"
  voucher?: string;  // Some networks require a voucher code
}

export interface FlutterwaveChargeResponse {
  status: "success" | "error";
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: "pending" | "successful" | "failed";
    payment_type: string;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
    };
    meta: Record<string, unknown>;
  };
}

export interface FlutterwaveVerifyResponse {
  status: "success" | "error";
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: "pending" | "successful" | "failed";
    payment_type: string;
  };
}

// ─────────────────────────────────────────────
// HTTP helper
// ─────────────────────────────────────────────

async function fw<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok || json.status === "error") {
    throw new Error(
      `Flutterwave error: ${json.message || res.statusText}`
    );
  }

  return json;
}

// ─────────────────────────────────────────────
// M-Pesa (Kenya KES)
// ─────────────────────────────────────────────

export async function chargeMpesa(
  data: MpesaChargeRequest
): Promise<FlutterwaveChargeResponse> {
  return fw<FlutterwaveChargeResponse>("POST", "/charges?type=mpesa", {
    ...data,
    currency: "KES",
  });
}

// ─────────────────────────────────────────────
// Mobile Money (MTN, Orange, Wave, etc.)
// ─────────────────────────────────────────────

export async function chargeMobileMoney(
  data: MobileMoneyChargeRequest
): Promise<FlutterwaveChargeResponse> {
  const typeMap: Record<string, string> = {
    XOF: "mobile_money_franco",  // Francophone West Africa
    GHS: "mobile_money_ghana",
    NGN: "mobile_money_nigeria",
  };

  const chargeType = typeMap[data.currency] || "mobile_money_franco";

  return fw<FlutterwaveChargeResponse>(
    "POST",
    `/charges?type=${chargeType}`,
    data
  );
}

// ─────────────────────────────────────────────
// Verify a transaction
// ─────────────────────────────────────────────

export async function verifyTransaction(
  transactionId: string
): Promise<FlutterwaveVerifyResponse> {
  return fw<FlutterwaveVerifyResponse>(
    "GET",
    `/transactions/${transactionId}/verify`
  );
}

// ─────────────────────────────────────────────
// Verify webhook signature
// ─────────────────────────────────────────────

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  if (!secret) return false;

  // Flutterwave uses a simple hash comparison
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return hash === signature;
}

// ─────────────────────────────────────────────
// Exchange rates (Flutterwave provides rates)
// ─────────────────────────────────────────────

export interface ExchangeRateResponse {
  status: "success" | "error";
  data: {
    rate: number;
    source: { currency: string; amount: number };
    destination: { currency: string; amount: number };
  };
}

export async function getExchangeRate(
  from: string,
  to: string,
  amount: number
): Promise<ExchangeRateResponse> {
  return fw<ExchangeRateResponse>(
    "GET",
    `/transfers/rates?amount=${amount}&source_currency=${from}&destination_currency=${to}`
  );
}
