// ============================================
// Holding Normalization
// ============================================
// Normalize investment holding data from various sources to internal schema

import { normalizeCurrency } from './normalize-account';

// ============================================
// Input Types
// ============================================
export interface RawHolding {
  externalId: string;
  portfolioId: string;
  isin?: string;
  symbol?: string;
  name: string;
  quantity: number | string;
  averageCost: number | string;
  currentPrice: number | string;
  currency: string | undefined;
  marketValue?: number | string;
  gain?: number | string;
  gainPercent?: number | string;
  lastUpdated?: Date | string;
  institutionId: string;
  userId: string;
}

export interface NormalizedHolding {
  externalId: string;
  portfolioId: string;
  isin?: string;
  symbol?: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  currency: string;
  marketValue: number;
  totalGain: number;
  totalGainPercent?: number;
  lastUpdated: Date;
  institutionId: string;
  userId: string;
}

// ============================================
// Normalization Functions
// ============================================

/**
 * Normalize holding data from external source
 */
export function normalizeHolding(
  raw: RawHolding
): NormalizedHolding {
  const quantity = normalizeAmount(raw.quantity);
  const averageCost = normalizeAmount(raw.averageCost);
  const currentPrice = normalizeAmount(raw.currentPrice);
  const marketValue = normalizeAmount(raw.marketValue || quantity * currentPrice);

  // Calculate gain if not provided
  const totalGain = normalizeAmount(raw.gain || marketValue - quantity * averageCost);
  const totalGainPercent =
    normalizeAmount(raw.gainPercent) ||
    (quantity * averageCost > 0 ? (totalGain / (quantity * averageCost)) * 100 : 0);

  return {
    externalId: raw.externalId,
    portfolioId: raw.portfolioId,
    isin: raw.isin?.toUpperCase().trim(),
    symbol: raw.symbol?.toUpperCase().trim(),
    name: raw.name.trim(),
    quantity,
    averageCost,
    currentPrice,
    currency: normalizeCurrency(raw.currency),
    marketValue,
    totalGain,
    totalGainPercent,
    lastUpdated: normalizeDate(raw.lastUpdated),
    institutionId: raw.institutionId,
    userId: raw.userId,
  };
}

/**
 * Normalize amount (handles strings with commas, currency symbols, etc.)
 */
export function normalizeAmount(value: number | string | undefined): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    // Remove currency symbols and spaces
    let clean = value.replace(/[^\d.,-]/g, '');

    // Handle negative values in parentheses
    if (clean.startsWith('(') && clean.endsWith(')')) {
      clean = '-' + clean.slice(1, -1);
    }

    // Handle comma as decimal separator (French format)
    if (clean.includes(',') && !clean.includes('.')) {
      return parseFloat(clean.replace(',', '.'));
    }

    // Handle both comma and dot (e.g., "1.234,56")
    if (clean.includes(',') && clean.includes('.')) {
      // Assume dot is thousands separator, comma is decimal
      const withoutThousands = clean.replace('.', '');
      return parseFloat(withoutThousands.replace(',', '.'));
    }

    return parseFloat(clean);
  }

  return 0;
}

/**
 * Normalize date
 */
export function normalizeDate(date?: Date | string): Date {
  if (!date) return new Date();

  if (date instanceof Date) return date;

  if (typeof date === 'string') {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

/**
 * Normalize ISIN (International Securities Identification Number)
 */
export function normalizeISIN(isin?: string): string | undefined {
  if (!isin) return undefined;
  return isin.toUpperCase().trim();
}

/**
 * Normalize symbol/ticker
 */
export function normalizeSymbol(symbol?: string): string | undefined {
  if (!symbol) return undefined;
  return symbol.toUpperCase().trim();
}

// ============================================
// Calculation Functions
// ============================================

/**
 * Calculate total value of holding
 */
export function calculateMarketValue(
  quantity: number,
  currentPrice: number
): number {
  return Math.round(quantity * currentPrice * 100) / 100;
}

/**
 * Calculate gain/loss
 */
export function calculateGain(
  marketValue: number,
  costBasis: number
): number {
  return Math.round((marketValue - costBasis) * 100) / 100;
}

/**
 * Calculate gain/loss percentage
 */
export function calculateGainPercent(
  marketValue: number,
  costBasis: number
): number {
  if (costBasis === 0) return 0;
  return Math.round(((marketValue - costBasis) / costBasis) * 10000) / 100;
}

/**
 * Calculate cost basis (total investment)
 */
export function calculateCostBasis(
  quantity: number,
  averageCost: number
): number {
  return Math.round(quantity * averageCost * 100) / 100;
}

/**
 * Determine if holding is profitable
 */
export function isProfitable(holding: {
  totalGain: number;
  totalGainPercent?: number;
}): boolean {
  return (holding.totalGain || 0) > 0;
}

/**
 * Determine if holding is in loss
 */
export function isInLoss(holding: {
  totalGain: number;
  totalGainPercent?: number;
}): boolean {
  return (holding.totalGain || 0) < 0;
}

/**
 * Classify holding by type based on ISIN/symbol
 */
export function classifyHoldingType(isin?: string, symbol?: string): string {
  if (!isin && !symbol) return 'UNKNOWN';

  const identifier = (isin || '').concat(symbol || '').toUpperCase();

  // French securities often have specific ISIN prefixes
  if (identifier.includes('FR')) {
    // Check for SICAV/FCP (French investment funds)
    if (identifier.includes('FCP') || identifier.includes('SICAV')) {
      return 'FUND';
    }
    return 'EQUITY';
  }

  // ETF detection
  if (symbol && (symbol.endsWith('.PA') || symbol.endsWith('.AS'))) {
    return 'ETF';
  }

  return 'EQUITY';
}
