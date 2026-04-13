/**
 * Wise Platform Integration
 * Handles Europe-side disbursement (SEPA EUR, FPS GBP)
 * Wise Platform = Wise API for businesses/distributors
 * Docs: https://docs.wise.com/api-docs/guides/send-money
 *
 * Model: we create a quote → create a transfer → fund it
 * No licence needed — we act as a Wise Platform distributor
 */

const BASE_URL = process.env.WISE_API_ENV === "production"
  ? "https://api.wise.com"
  : "https://api.sandbox.transferwise.tech";

const API_KEY = process.env.WISE_API_KEY!;
const PROFILE_ID = process.env.WISE_PROFILE_ID!;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface WiseQuote {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  fee: number;
  estimatedDelivery: string;
  paymentOptions: WisePaymentOption[];
}

export interface WisePaymentOption {
  disabled: boolean;
  estimatedDelivery: string;
  formattedEstimatedDelivery: string;
  payIn: string;   // "BANK_TRANSFER" | "DEBIT" | "CREDIT"
  payOut: string;  // "BANK_TRANSFER" | "BALANCE"
  fee: {
    transferwise: number;
    payIn: number;
    discount: number;
    total: number;
    priceSetId: number;
  };
  price: {
    priceSetId: number;
    total: { type: string; label: string; value: { amount: number; currency: string } };
  };
}

export interface WiseRecipient {
  id: number;
  type: "iban" | "sort_code";
  profile: number;
  accountHolderName: string;
  currency: string;
  country: string;
  details: {
    iban?: string;
    accountNumber?: string;
    sortCode?: string;
    legalType?: "PRIVATE" | "BUSINESS";
    address?: {
      country: string;
      city: string;
      postCode: string;
      firstLine: string;
    };
  };
}

export interface WiseTransfer {
  id: number;
  targetAccount: number;
  quote: string;
  status: "incoming_payment_waiting" | "processing" | "outgoing_payment_sent" | "cancelled" | "funds_refunded";
  reference: string;
  rate: number;
  created: string;
  business: number;
  transferRequest: null;
  details: {
    reference: string;
    transferPurpose: string;
    sourceOfFunds: string;
  };
}

// ─────────────────────────────────────────────
// HTTP helper
// ─────────────────────────────────────────────

async function wise<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    const msg =
      json.errors?.[0]?.message ||
      json.error_description ||
      json.message ||
      res.statusText;
    throw new Error(`Wise API error: ${msg}`);
  }

  return json;
}

// ─────────────────────────────────────────────
// Quotes (FX + fee calculation)
// ─────────────────────────────────────────────

export async function createQuote(params: {
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount?: number;
  targetAmount?: number;
}): Promise<WiseQuote> {
  return wise<WiseQuote>("POST", `/v3/profiles/${PROFILE_ID}/quotes`, {
    sourceCurrency: params.sourceCurrency,
    targetCurrency: params.targetCurrency,
    sourceAmount: params.sourceAmount,
    targetAmount: params.targetAmount,
    payOut: "BANK_TRANSFER",
  });
}

// ─────────────────────────────────────────────
// Recipients (beneficiaries)
// ─────────────────────────────────────────────

export async function createIbanRecipient(params: {
  accountHolderName: string;
  iban: string;
  currency: string;
  country: string;
}): Promise<WiseRecipient> {
  return wise<WiseRecipient>("POST", "/v1/accounts", {
    profile: PROFILE_ID,
    type: "iban",
    accountHolderName: params.accountHolderName,
    currency: params.currency,
    details: {
      legalType: "PRIVATE",
      iban: params.iban.replace(/\s/g, ""),
    },
  });
}

export async function createUkRecipient(params: {
  accountHolderName: string;
  accountNumber: string;
  sortCode: string;
}): Promise<WiseRecipient> {
  return wise<WiseRecipient>("POST", "/v1/accounts", {
    profile: PROFILE_ID,
    type: "sort_code",
    accountHolderName: params.accountHolderName,
    currency: "GBP",
    details: {
      legalType: "PRIVATE",
      accountNumber: params.accountNumber.replace(/\s/g, ""),
      sortCode: params.sortCode.replace(/[-\s]/g, ""),
    },
  });
}

// ─────────────────────────────────────────────
// Transfers
// ─────────────────────────────────────────────

export async function createTransfer(params: {
  targetAccountId: number;
  quoteId: string;
  transactionId: string;
  reference?: string;
}): Promise<WiseTransfer> {
  return wise<WiseTransfer>("POST", "/v1/transfers", {
    targetAccount: params.targetAccountId,
    quote: params.quoteId,
    customerTransactionId: params.transactionId,
    details: {
      reference: params.reference || "Tinda Cash Transfer",
      transferPurpose: "personal_remittance",
      sourceOfFunds: "savings",
    },
  });
}

export async function fundTransfer(transferId: number): Promise<{ status: string }> {
  return wise<{ status: string }>(
    "POST",
    `/v3/profiles/${PROFILE_ID}/transfers/${transferId}/payments`,
    { type: "BALANCE" }
  );
}

export async function getTransferStatus(transferId: number): Promise<WiseTransfer> {
  return wise<WiseTransfer>("GET", `/v1/transfers/${transferId}`);
}

// ─────────────────────────────────────────────
// Batch: full EUR/GBP transfer flow
// ─────────────────────────────────────────────

export async function executeEurTransfer(params: {
  beneficiaryIban: string;
  beneficiaryName: string;
  amount: number;
  transactionId: string;
  reference?: string;
}): Promise<{ wiseTransferId: number; status: string }> {
  // 1. Create quote
  const quote = await createQuote({
    sourceCurrency: "EUR",
    targetCurrency: "EUR",
    sourceAmount: params.amount,
  });

  // 2. Create recipient
  const recipient = await createIbanRecipient({
    accountHolderName: params.beneficiaryName,
    iban: params.beneficiaryIban,
    currency: "EUR",
    country: "FR", // default France — override as needed
  });

  // 3. Create transfer
  const transfer = await createTransfer({
    targetAccountId: recipient.id,
    quoteId: quote.id,
    transactionId: params.transactionId,
    reference: params.reference,
  });

  // 4. Fund it from Wise balance
  await fundTransfer(transfer.id);

  return { wiseTransferId: transfer.id, status: transfer.status };
}

// ─────────────────────────────────────────────
// Webhook signature verification
// ─────────────────────────────────────────────

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const crypto = require("crypto");
    const verify = crypto.createVerify("SHA256");
    verify.update(payload);
    return verify.verify(publicKey, signature, "base64");
  } catch {
    return false;
  }
}
