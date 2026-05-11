// ============================================
// Currency utilities
// ============================================
// Type for Prisma Decimal (runtime type)
type PrismaDecimal = {
  toNumber: () => number;
};

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number | PrismaDecimal,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  const numberAmount = typeof amount === 'object' ? amount.toNumber() : amount;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberAmount);
}

/**
 * Convert amount between currencies (simplified - use external API for real rates)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  // Simple conversion rates for demo - in production use:
  // - European Central Bank API
  // - ExchangeRate-API
  // - OpenExchangeRates

  const EUR_TO_USD = 1.08;
  const EUR_TO_GBP = 0.86;
  const EUR_TO_CHF = 0.95;

  const rates: Record<string, number> = {
    USD: EUR_TO_USD,
    GBP: EUR_TO_GBP,
    CHF: EUR_TO_CHF,
  };

  if (fromCurrency === toCurrency) return amount;

  if (fromCurrency === 'EUR') {
    return amount * (rates[toCurrency] || 1);
  }

  if (toCurrency === 'EUR') {
    return amount / (rates[fromCurrency] || 1);
  }

  // Cross rate
  return (amount / (rates[fromCurrency] || 1)) * (rates[toCurrency] || 1);
}

/**
 * Check if currency is a reserve currency
 */
export function isReserveCurrency(currency: string): boolean {
  return ['USD', 'EUR', 'GBP', 'CHF', 'JPY'].includes(currency);
}

/**
 * Normalize currency code
 */
export function normalizeCurrency(currency: string): string {
  return currency.toUpperCase().trim() || 'EUR';
}
