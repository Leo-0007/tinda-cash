import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale = "fr-FR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAmount(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\+\d{1,3})(\d{2,3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
}

export function maskIban(iban: string): string {
  if (!iban) return "";
  return iban.slice(0, 4) + " •••• •••• " + iban.slice(-4);
}

export function maskCard(card: string): string {
  return "•••• •••• •••• " + card.slice(-4);
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} jours`;

  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    INITIATED: "Initié",
    PROCESSING: "En cours",
    SENT: "Envoyé",
    COMPLETED: "Complété",
    FAILED: "Échoué",
    REFUNDED: "Remboursé",
    CANCELLED: "Annulé",
  };
  return labels[status] || status;
}

export function getStatusVariant(status: string): "success" | "warning" | "danger" | "info" | "neutral" {
  const variants: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
    INITIATED: "neutral",
    PROCESSING: "info",
    SENT: "warning",
    COMPLETED: "success",
    FAILED: "danger",
    REFUNDED: "warning",
    CANCELLED: "neutral",
  };
  return variants[status] || "neutral";
}

export function generateTransactionRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TC-${timestamp}-${random}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function isValidIban(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  if (cleaned.length < 15 || cleaned.length > 34) return false;
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numericStr = rearranged.replace(/[A-Z]/g, (c) =>
    (c.charCodeAt(0) - 55).toString()
  );
  let remainder = BigInt(0);
  for (const char of numericStr) {
    remainder = (remainder * 10n + BigInt(parseInt(char))) % 97n;
  }
  return remainder === 1n;
}
