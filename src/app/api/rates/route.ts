import { NextResponse } from "next/server";

// Exchange rates with cache (refresh every 5 minutes)
let ratesCache: { data: Rate[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

interface Rate {
  from: string;
  to: string;
  rate: number;
  fee_percent: number;
  min_amount: number;
  max_amount: number;
}

// Base rates — will be replaced by live API (Thunes, Open Exchange Rates)
const BASE_RATES: Rate[] = [
  { from: "CAD", to: "DZD", rate: 99.5, fee_percent: 1.5, min_amount: 10, max_amount: 10000 },
  { from: "CAD", to: "TND", rate: 2.28, fee_percent: 1.5, min_amount: 10, max_amount: 10000 },
  { from: "QAR", to: "DZD", rate: 37.2, fee_percent: 2.0, min_amount: 50, max_amount: 20000 },
  { from: "QAR", to: "TND", rate: 0.85, fee_percent: 2.0, min_amount: 50, max_amount: 20000 },
  { from: "AED", to: "DZD", rate: 36.8, fee_percent: 2.0, min_amount: 50, max_amount: 20000 },
  { from: "AED", to: "TND", rate: 0.84, fee_percent: 2.0, min_amount: 50, max_amount: 20000 },
  { from: "CAD", to: "QAR", rate: 2.71, fee_percent: 1.0, min_amount: 10, max_amount: 10000 },
  { from: "CAD", to: "AED", rate: 2.73, fee_percent: 1.0, min_amount: 10, max_amount: 10000 },
  { from: "QAR", to: "AED", rate: 1.01, fee_percent: 0.5, min_amount: 100, max_amount: 50000 },
  { from: "DZD", to: "TND", rate: 0.023, fee_percent: 2.5, min_amount: 5000, max_amount: 500000 },
];

async function fetchLiveRates(): Promise<Rate[]> {
  // TODO: Replace with live API calls (Thunes / Open Exchange Rates)
  // For now, add small random variation to simulate live rates
  return BASE_RATES.map((r) => ({
    ...r,
    rate: +(r.rate * (1 + (Math.random() - 0.5) * 0.005)).toFixed(4),
  }));
}

export async function GET() {
  try {
    const now = Date.now();

    if (!ratesCache || now - ratesCache.timestamp > CACHE_TTL) {
      const rates = await fetchLiveRates();
      ratesCache = { data: rates, timestamp: now };
    }

    return NextResponse.json({
      rates: ratesCache.data,
      updated_at: new Date(ratesCache.timestamp).toISOString(),
      cache_ttl_seconds: Math.round(CACHE_TTL / 1000),
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de recuperer les taux" },
      { status: 500 }
    );
  }
}
