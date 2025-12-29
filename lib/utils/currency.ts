/**
 * Format a decimal string or number as currency
 */
export function formatCurrency(amount: string | number, currency: string = "GBP"): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Convert pounds to pence (smallest currency unit)
 */
export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100);
}

/**
 * Convert pence to pounds
 */
export function penceToPounds(pence: number): number {
  return pence / 100;
}
