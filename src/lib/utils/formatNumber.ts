/**
 * Hydration-safe number formatting.
 *
 * toLocaleString() produces different output on server vs client when the
 * runtime locale differs (e.g. Node "2,000" vs browser fr-CA "2 000").
 * This utility always formats with a fixed locale so SSR and CSR match.
 */

const LOCALE = "fr-CA";

export function formatNumber(value: number, decimals?: number): string {
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(
  value: number,
  currency: string,
  decimals = 2
): string {
  return `${formatNumber(value, decimals)} ${currency}`;
}
