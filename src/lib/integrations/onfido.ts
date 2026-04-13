/**
 * Onfido KYC Integration
 * Identity verification: document check + selfie/liveness
 * ~€1.50/verification, 190+ countries
 * Docs: https://documentation.onfido.com/
 */

const BASE_URL = "https://api.eu.onfido.com/v3.6"; // EU region
const API_TOKEN = process.env.ONFIDO_API_TOKEN!;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface OnfidoApplicant {
  id: string;
  created_at: string;
  href: string;
  first_name: string;
  last_name: string;
  email?: string;
  dob?: string;
  id_numbers?: Array<{
    type: string;
    value: string;
    state_code?: string;
  }>;
}

export interface OnfidoDocument {
  id: string;
  applicant_id: string;
  type: "passport" | "national_identity_card" | "driving_licence" | "residence_permit";
  side: "front" | "back";
  file_name: string;
  created_at: string;
  href: string;
}

export interface OnfidoCheck {
  id: string;
  created_at: string;
  href: string;
  status: "in_progress" | "awaiting_applicant" | "complete";
  result: "clear" | "consider" | null;
  report_ids: string[];
  applicant_id: string;
  results_uri: string;
  form_uri: string | null;
}

export interface OnfidoReport {
  id: string;
  name: "document" | "facial_similarity_photo" | "identity_enhanced";
  status: "awaiting_data" | "awaiting_approval" | "cancelled" | "complete";
  result: "clear" | "consider" | "unidentified" | null;
  created_at: string;
  breakdown: Record<string, { result: string; breakdown?: Record<string, unknown> }>;
}

export interface OnfidoSdkToken {
  token: string;
  applicant_id: string;
}

// ─────────────────────────────────────────────
// HTTP helper
// ─────────────────────────────────────────────

async function onfido<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Token token=${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    const errMsg =
      json.error?.message ||
      json.error?.fields?.[Object.keys(json.error?.fields || {})[0]]?.[0] ||
      res.statusText;
    throw new Error(`Onfido error: ${errMsg}`);
  }

  return json;
}

// ─────────────────────────────────────────────
// Applicants
// ─────────────────────────────────────────────

export async function createApplicant(params: {
  firstName: string;
  lastName: string;
  email?: string;
  dob?: string; // ISO: "1990-01-15"
}): Promise<OnfidoApplicant> {
  return onfido<OnfidoApplicant>("POST", "/applicants", {
    first_name: params.firstName,
    last_name: params.lastName,
    email: params.email,
    dob: params.dob,
  });
}

export async function getApplicant(applicantId: string): Promise<OnfidoApplicant> {
  return onfido<OnfidoApplicant>("GET", `/applicants/${applicantId}`);
}

// ─────────────────────────────────────────────
// SDK Token (for Onfido Web SDK)
// ─────────────────────────────────────────────

export async function generateSdkToken(params: {
  applicantId: string;
  referrer?: string; // e.g. "https://tindacash.com/*"
}): Promise<OnfidoSdkToken> {
  return onfido<OnfidoSdkToken>("POST", "/sdk_token", {
    applicant_id: params.applicantId,
    referrer: params.referrer || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/*`,
  });
}

// ─────────────────────────────────────────────
// Checks (run KYC check)
// ─────────────────────────────────────────────

export async function createCheck(params: {
  applicantId: string;
  reportNames?: string[];
  documentIds?: string[];
}): Promise<OnfidoCheck> {
  return onfido<OnfidoCheck>("POST", "/checks", {
    applicant_id: params.applicantId,
    report_names: params.reportNames || [
      "document",
      "facial_similarity_photo",
    ],
    document_ids: params.documentIds,
    applicant_provides_data: false, // We send documents via API
  });
}

export async function getCheck(checkId: string): Promise<OnfidoCheck> {
  return onfido<OnfidoCheck>("GET", `/checks/${checkId}`);
}

// ─────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────

export async function getReport(reportId: string): Promise<OnfidoReport> {
  return onfido<OnfidoReport>("GET", `/reports/${reportId}`);
}

// ─────────────────────────────────────────────
// Webhook verification
// ─────────────────────────────────────────────

export function verifyWebhookToken(
  token: string
): boolean {
  return token === process.env.ONFIDO_WEBHOOK_TOKEN;
}

// ─────────────────────────────────────────────
// Interpret check result for our DB
// ─────────────────────────────────────────────

export function interpretCheckResult(
  check: OnfidoCheck
): "approved" | "rejected" | "pending" {
  if (check.status !== "complete") return "pending";
  if (check.result === "clear") return "approved";
  if (check.result === "consider") return "rejected";
  return "pending";
}
