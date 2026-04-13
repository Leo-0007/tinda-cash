import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Supported currency pairs with fee tiers
const FEE_TIERS: Record<string, { pct: number; min: number }> = {
  // Africa → Europe
  "NGN-EUR": { pct: 0.012, min: 2.5 },
  "NGN-GBP": { pct: 0.012, min: 2.0 },
  "XOF-EUR": { pct: 0.009, min: 1.5 },
  "MAD-EUR": { pct: 0.010, min: 2.0 },
  "KES-GBP": { pct: 0.011, min: 1.8 },
  "GHS-GBP": { pct: 0.013, min: 2.2 },
  // Europe → Africa
  "EUR-NGN": { pct: 0.010, min: 1.5 },
  "EUR-XOF": { pct: 0.008, min: 1.0 },
  "EUR-MAD": { pct: 0.009, min: 1.5 },
  "EUR-KES": { pct: 0.010, min: 1.5 },
  "EUR-GHS": { pct: 0.011, min: 1.5 },
  "GBP-NGN": { pct: 0.010, min: 1.2 },
  "GBP-KES": { pct: 0.010, min: 1.2 },
  "GBP-GHS": { pct: 0.012, min: 1.5 },
  default: { pct: 0.015, min: 3.0 },
};

// Estimated delivery times
const DELIVERY_TIMES: Record<string, string> = {
  "NGN-EUR": "~2 minutes",
  "NGN-GBP": "~2 minutes",
  "XOF-EUR": "< 5 minutes",
  "MAD-EUR": "~5 minutes",
  "KES-GBP": "~2 minutes",
  "GHS-GBP": "~5 minutes",
  "EUR-NGN": "< 5 minutes",
  "EUR-XOF": "< 5 minutes",
  "EUR-MAD": "< 10 minutes",
  "EUR-KES": "< 5 minutes",
  "EUR-GHS": "< 5 minutes",
  "GBP-NGN": "< 5 minutes",
  "GBP-KES": "~2 minutes",
  "GBP-GHS": "< 5 minutes",
  default: "< 10 minutes",
};

// GET /api/rates?from=NGN&to=EUR&amount=50000
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from")?.toUpperCase();
    const to = searchParams.get("to")?.toUpperCase();
    const amountStr = searchParams.get("amount");

    if (!from || !to) {
      return NextResponse.json(
        { error: "Paramètres from et to requis" },
        { status: 400 }
      );
    }

    const amount = amountStr ? parseFloat(amountStr) : undefined;

    // Try DB first (cached rates, max 1h old)
    let rate: number;
    let cachedRate = null;

    try {
      cachedRate = await db.exchangeRate.findFirst({
        where: {
          fromCurrency: from,
          toCurrency: to,
          updatedAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
        },
        orderBy: { updatedAt: "desc" },
      });
    } catch {
      // DB not available — will fallback to mock/API rates
      console.warn("[rates] DB unavailable, using fallback rates");
    }

    if (cachedRate) {
      rate = cachedRate.rate;
    } else {
      // Fetch from external API (or mock in dev)
      rate = await fetchLiveRate(from, to);

      // Cache it (skip if DB unavailable)
      try {
        await db.exchangeRate.upsert({
          where: {
            fromCurrency_toCurrency: {
              fromCurrency: from,
              toCurrency: to,
            },
          },
          create: {
            fromCurrency: from,
            toCurrency: to,
            rate,
            source: "exchangerate-api",
          },
          update: {
            rate,
            source: "exchangerate-api",
            updatedAt: new Date(),
          },
        });
      } catch {
        // DB write failed — rates still work, just not cached
      }
    }

    // Calculate fee
    const pair = `${from}-${to}`;
    const tier = FEE_TIERS[pair] || FEE_TIERS.default;
    const deliveryTime = DELIVERY_TIMES[pair] || DELIVERY_TIMES.default;

    let sendAmount: number | undefined;
    let receiveAmount: number | undefined;
    let fee: number | undefined;

    if (amount) {
      // We deduct fee from send amount
      fee = Math.max(tier.min, amount * tier.pct);
      const netAmount = amount - fee;
      // rate = conversion_rate from ExchangeRate-API: "1 unit of FROM = rate units of TO"
      // e.g. EUR→NGN rate=1818.18 means 1 EUR = 1818.18 NGN
      // e.g. NGN→EUR rate=0.00055 means 1 NGN = 0.00055 EUR
      receiveAmount = parseFloat((netAmount * rate).toFixed(2));
      sendAmount = amount;
    }

    return NextResponse.json({
      from,
      to,
      rate,
      mid: rate, // mid-market rate (same as rate in our model — we make margin in the spread)
      fee: fee ?? undefined,
      feePct: tier.pct * 100,
      feeMin: tier.min,
      sendAmount,
      receiveAmount,
      deliveryTime,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[rates]", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les taux" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// Fetch from ExchangeRate-API (free tier: 1500 req/month)
// Fallback to mock rates for dev
// ─────────────────────────────────────────────

const MOCK_RATES: Record<string, number> = {
  // Africa → Europe
  "NGN-EUR": 0.00055,
  "NGN-GBP": 0.00052,
  "NGN-USD": 0.00065,
  "XOF-EUR": 0.00152,
  "XOF-GBP": 0.00144,
  "MAD-EUR": 0.09250,
  "MAD-GBP": 0.08780,
  "KES-GBP": 0.00617,
  "KES-EUR": 0.00651,
  "GHS-GBP": 0.05910,
  "GHS-EUR": 0.06240,
  // Europe → Africa
  "EUR-NGN": 1818.18,
  "EUR-XOF": 655.957,
  "EUR-MAD": 10.81,
  "EUR-KES": 153.61,
  "EUR-GHS": 16.03,
  "GBP-NGN": 1923.08,
  "GBP-KES": 162.07,
  "GBP-GHS": 16.92,
  // Cross
  "EUR-USD": 1.0820,
  "EUR-CHF": 0.9440,
  "USD-CHF": 0.8720,
  "CHF-XOF": 696.23,
  "CHF-NGN": 1928.57,
};

async function fetchLiveRate(from: string, to: string): Promise<number> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    // Dev fallback
    const key = `${from}-${to}`;
    const rate = MOCK_RATES[key];
    if (!rate) {
      // Try inverse
      const inverseKey = `${to}-${from}`;
      const inverseRate = MOCK_RATES[inverseKey];
      if (inverseRate) return parseFloat((1 / inverseRate).toFixed(6));
      throw new Error(`No rate found for ${from}-${to}`);
    }
    return rate;
  }

  // Use ExchangeRate-API
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`,
    { next: { revalidate: 3600 } } // Next.js ISR cache for 1h
  );

  if (!res.ok) {
    throw new Error(`ExchangeRate API error: ${res.statusText}`);
  }

  const data = await res.json();

  if (data.result !== "success") {
    throw new Error(`ExchangeRate API: ${data["error-type"]}`);
  }

  return data.conversion_rate;
}
