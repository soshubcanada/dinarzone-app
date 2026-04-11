import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DbCurrencyCorridor } from "@/lib/types/database";

// In-memory cache (per server instance)
let ratesCache: { data: CorridorQuote[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

interface CorridorQuote {
  corridor_code: string;
  from: string;
  to: string;
  mid_market_rate: number;
  dz_rate: number;
  margin_percent: number;
  fee_flat: number;
  fee_percent: number;
  min_amount: number;
  max_amount: number;
}

/**
 * Fetch corridors from Supabase. Falls back to hardcoded rates
 * if the database is unreachable (e.g. no env vars configured).
 */
async function fetchCorridorRates(): Promise<CorridorQuote[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("currency_corridors")
      .select("*")
      .eq("is_active", true)
      .order("corridor_code");

    if (error || !data || data.length === 0) {
      return buildFallbackRates();
    }

    return (data as DbCurrencyCorridor[]).map((c) => ({
      corridor_code: c.corridor_code.trim(),
      from: c.source_currency.trim(),
      to: c.target_currency.trim(),
      mid_market_rate: Number(c.mid_market_rate),
      dz_rate: +(Number(c.mid_market_rate) * (1 - Number(c.dz_margin_percent))).toFixed(4),
      margin_percent: Number(c.dz_margin_percent) * 100,
      fee_flat: Number(c.fee_flat),
      fee_percent: Number(c.fee_percent) * 100,
      min_amount: Number(c.min_amount),
      max_amount: Number(c.max_amount),
    }));
  } catch {
    return buildFallbackRates();
  }
}

/** Hardcoded fallback matching the rate engine constants */
function buildFallbackRates(): CorridorQuote[] {
  const corridors = [
    { code: "CA-DZ", from: "CAD", to: "DZD", mid: 100.3, margin: 0.8 },
    { code: "CA-TN", from: "CAD", to: "TND", mid: 2.30, margin: 0.9 },
    { code: "CA-QA", from: "CAD", to: "QAR", mid: 2.74, margin: 0.7 },
    { code: "CA-AE", from: "CAD", to: "AED", mid: 2.76, margin: 0.7 },
    { code: "QA-DZ", from: "QAR", to: "DZD", mid: 37.6, margin: 1.2 },
    { code: "QA-TN", from: "QAR", to: "TND", mid: 0.86, margin: 1.2 },
    { code: "QA-AE", from: "QAR", to: "AED", mid: 1.01, margin: 0.5 },
    { code: "AE-DZ", from: "AED", to: "DZD", mid: 37.2, margin: 1.1 },
    { code: "AE-TN", from: "AED", to: "TND", mid: 0.85, margin: 1.1 },
    { code: "DZ-TN", from: "DZD", to: "TND", mid: 0.0233, margin: 1.5 },
  ];

  return corridors.map((c) => ({
    corridor_code: c.code,
    from: c.from,
    to: c.to,
    mid_market_rate: c.mid,
    dz_rate: +(c.mid * (1 - c.margin / 100)).toFixed(4),
    margin_percent: c.margin,
    fee_flat: 0,
    fee_percent: 0,
    min_amount: 10,
    max_amount: 10000,
  }));
}

export async function GET() {
  try {
    const now = Date.now();

    if (!ratesCache || now - ratesCache.timestamp > CACHE_TTL) {
      const rates = await fetchCorridorRates();
      ratesCache = { data: rates, timestamp: now };
    }

    // Strip internal margin data from public response
    const publicCorridors = ratesCache.data.map(({ margin_percent, ...rest }) => rest);

    return NextResponse.json({
      corridors: publicCorridors,
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
