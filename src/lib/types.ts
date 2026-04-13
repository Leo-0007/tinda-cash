/** Shared TypeScript interfaces used by both API routes and frontend pages */

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  country: string;
  kycStatus: string;
  kycLevel: number;
  phoneVerified: boolean;
  referralCode: string | null;
  createdAt: string;
  wallets: ApiWallet[];
}

export interface ApiWallet {
  id: string;
  currency: string;
  balance: number;
  reserved: number;
}

export interface ApiTransaction {
  id: string;
  ref: string;
  fromCurrency: string;
  fromAmount: number;
  fromCountry: string;
  toCurrency: string;
  toAmount: number;
  toCountry: string;
  rate: number;
  fee: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  completedAt: string | null;
  beneficiary: {
    id: string;
    name: string;
    type: string;
    country: string;
  } | null;
}

export interface ApiBeneficiary {
  id: string;
  name: string;
  type: string;
  currency: string;
  country: string;
  iban: string | null;
  phone: string | null;
  sortCode: string | null;
  accountNumber: string | null;
  bankName: string | null;
  isFavorite: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiRateResponse {
  from: string;
  to: string;
  rate: number;
  fee: number;
  feePercent: number;
  deliveryTime: string;
  amount?: number;
  convertedAmount?: number;
}

export interface TransactionsListResponse {
  transactions: ApiTransaction[];
  pagination: PaginationInfo;
}

export interface BeneficiariesListResponse {
  beneficiaries: ApiBeneficiary[];
}

export interface AuthMeResponse {
  user: ApiUser;
}

export type TransferDirection = "africa_to_europe" | "europe_to_africa";
