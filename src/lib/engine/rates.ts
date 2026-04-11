/**
 * DinarZone Rate Engine
 *
 * Centralized exchange rate calculations with:
 * - Multi-corridor rate management
 * - Tiered fee structure (amount-based)
 * - Rate locking with TTL
 * - Bank comparison for savings display
 * - Margin management for business model
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CorridorRate {
  corridorId: string;
  from: string;
  to: string;
  /** Mid-market rate (base) */
  midMarketRate: number;
  /** DinarZone displayed rate (mid-market minus margin) */
  dzRate: number;
  /** Our margin percentage applied on top of mid-market */
  marginPercent: number;
  feePercent: number;
  minAmount: number;
  maxAmount: number;
  updatedAt: string;
}

export interface FeeBreakdown {
  /** Fixed platform fee */
  fixedFee: number;
  /** Percentage-based fee amount */
  percentFee: number;
  /** Total fee charged */
  totalFee: number;
  /** Fee percentage for display */
  feePercent: number;
  /** Delivery method surcharge */
  deliverySurcharge: number;
}

export interface QuoteResult {
  corridorId: string;
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  dzRate: number;
  midMarketRate: number;
  fees: FeeBreakdown;
  totalCharged: number;
  /** What banks would give (for savings comparison) */
  bankReceiveAmount: number;
  savings: number;
  /** Rate lock expiration (ISO string) */
  rateLockExpiresAt: string;
  /** Rate lock TTL in seconds */
  rateLockTTL: number;
}

export interface RateTrend {
  corridorId: string;
  from: string;
  to: string;
  rate: number;
  previousRate: number;
  direction: "up" | "down" | "stable";
  delta: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Rate lock duration in seconds */
const RATE_LOCK_TTL = 15 * 60; // 15 minutes

/** Typical bank markup for savings comparison */
const BANK_MARKUP_PERCENT = 4.0;

/** DinarZone margin on mid-market rate (our revenue) */
const DEFAULT_MARGIN_PERCENT = 0.8;

/** Tiered fee schedule based on send amount (in source currency) */
const FEE_TIERS = [
  { maxAmount: 100, fixedFee: 1.99, percentFee: 0 },
  { maxAmount: 500, fixedFee: 3.99, percentFee: 0 },
  { maxAmount: 1000, fixedFee: 4.99, percentFee: 0 },
  { maxAmount: 3000, fixedFee: 4.99, percentFee: 0.5 },
  { maxAmount: 5000, fixedFee: 4.99, percentFee: 0.3 },
  { maxAmount: Infinity, fixedFee: 4.99, percentFee: 0.2 },
] as const;

/** Delivery method surcharges */
const DELIVERY_SURCHARGES: Record<string, number> = {
  baridimob_ccp: 0,
  cash_pickup: 2.0,
  bank_transfer: 0,
  d17_laposte: 0,
  exchange_house: 1.5,
  virtual_card: 0,
};

/**
 * Mid-market reference rates (base truth).
 * In production, these come from Open Exchange Rates / Thunes API.
 * Stored as source → destination = rate.
 */
const MID_MARKET_RATES: Record<string, number> = {
  "CAD-DZD": 100.3,
  "CAD-TND": 2.30,
  "CAD-QAR": 2.74,
  "CAD-AED": 2.76,
  "QAR-DZD": 37.6,
  "QAR-TND": 0.86,
  "QAR-AED": 1.01,
  "AED-DZD": 37.2,
  "AED-TND": 0.85,
  "DZD-TND": 0.0233,
};

/** Per-corridor margin overrides (some corridors are more competitive) */
const CORRIDOR_MARGINS: Record<string, number> = {
  "CA-DZ": 0.8,   // Core corridor — competitive
  "CA-TN": 0.9,
  "QA-DZ": 1.2,
  "QA-TN": 1.2,
  "AE-DZ": 1.1,
  "AE-TN": 1.1,
  "CA-QA": 0.7,   // Low-margin corridor
  "CA-AE": 0.7,
  "QA-AE": 0.5,   // Gulf-to-Gulf, very competitive
  "DZ-TN": 1.5,   // Niche corridor, higher margin
};

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/**
 * Get the DinarZone rate for a corridor (mid-market minus margin).
 */
export function getDzRate(corridorId: string): CorridorRate | null {
  const [from, to] = corridorId.split("-");
  const fromCurrency = CURRENCY_MAP[from];
  const toCurrency = CURRENCY_MAP[to];
  if (!fromCurrency || !toCurrency) return null;

  const rateKey = `${fromCurrency}-${toCurrency}`;
  const midMarket = MID_MARKET_RATES[rateKey];
  if (midMarket === undefined) return null;

  const margin = CORRIDOR_MARGINS[corridorId] ?? DEFAULT_MARGIN_PERCENT;
  const dzRate = +(midMarket * (1 - margin / 100)).toFixed(4);

  const feeTier = FEE_TIERS[2]; // default tier for display

  return {
    corridorId,
    from: fromCurrency,
    to: toCurrency,
    midMarketRate: midMarket,
    dzRate,
    marginPercent: margin,
    feePercent: feeTier.percentFee,
    minAmount: 10,
    maxAmount: 10000,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate fees for a given send amount and delivery method.
 */
export function calculateFees(
  sendAmount: number,
  deliveryMethod?: string
): FeeBreakdown {
  const tier = FEE_TIERS.find((t) => sendAmount <= t.maxAmount) ?? FEE_TIERS[FEE_TIERS.length - 1];
  const percentFee = +(sendAmount * (tier.percentFee / 100)).toFixed(2);
  const deliverySurcharge = deliveryMethod
    ? (DELIVERY_SURCHARGES[deliveryMethod] ?? 0)
    : 0;

  return {
    fixedFee: tier.fixedFee,
    percentFee,
    totalFee: +(tier.fixedFee + percentFee + deliverySurcharge).toFixed(2),
    feePercent: tier.percentFee,
    deliverySurcharge,
  };
}

/**
 * Generate a full transfer quote — the main entry point.
 */
export function getQuote(
  corridorId: string,
  sendAmount: number,
  deliveryMethod?: string
): QuoteResult | null {
  const corridorRate = getDzRate(corridorId);
  if (!corridorRate) return null;

  // Clamp amount to corridor limits
  const amount = Math.max(
    corridorRate.minAmount,
    Math.min(sendAmount, corridorRate.maxAmount)
  );

  const fees = calculateFees(amount, deliveryMethod);
  const receiveAmount = +(amount * corridorRate.dzRate).toFixed(2);
  const totalCharged = +(amount + fees.totalFee).toFixed(2);

  // Bank comparison
  const bankRate = corridorRate.midMarketRate * (1 - BANK_MARKUP_PERCENT / 100);
  const bankReceiveAmount = +(amount * bankRate).toFixed(2);
  const savings = +(receiveAmount - bankReceiveAmount).toFixed(2);

  // Rate lock
  const rateLockExpiresAt = new Date(
    Date.now() + RATE_LOCK_TTL * 1000
  ).toISOString();

  return {
    corridorId,
    sendAmount: amount,
    sendCurrency: corridorRate.from,
    receiveAmount,
    receiveCurrency: corridorRate.to,
    dzRate: corridorRate.dzRate,
    midMarketRate: corridorRate.midMarketRate,
    fees,
    totalCharged,
    bankReceiveAmount,
    savings,
    rateLockExpiresAt,
    rateLockTTL: RATE_LOCK_TTL,
  };
}

/**
 * Get all corridor rates with trend data for the dashboard ticker.
 */
export function getAllRatesWithTrends(): RateTrend[] {
  return Object.entries(CORRIDOR_MARGINS).map(([corridorId]) => {
    const rate = getDzRate(corridorId);
    if (!rate) return null;

    // Simulated previous rate (small random delta for demo)
    const variationPercent = (Math.random() - 0.4) * 0.6; // slight upward bias
    const previousRate = +(rate.dzRate / (1 + variationPercent / 100)).toFixed(4);
    const delta = +(rate.dzRate - previousRate).toFixed(2);

    return {
      corridorId,
      from: rate.from,
      to: rate.to,
      rate: rate.dzRate,
      previousRate,
      direction: delta > 0 ? "up" : delta < 0 ? "down" : "stable",
      delta: delta > 0 ? `+${delta}` : `${delta}`,
    } as RateTrend;
  }).filter(Boolean) as RateTrend[];
}

/**
 * Check if a rate lock is still valid.
 */
export function isRateLockValid(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() > Date.now();
}

/**
 * Get remaining seconds on rate lock.
 */
export function getRateLockRemaining(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CURRENCY_MAP: Record<string, string> = {
  CA: "CAD",
  DZ: "DZD",
  TN: "TND",
  QA: "QAR",
  AE: "AED",
  MA: "MAD",
  FR: "EUR",
  GB: "GBP",
  US: "USD",
  TR: "TRY",
};
