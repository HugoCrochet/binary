// ============================================
// Account Normalization
// ============================================
// Normalize account data from various sources to internal schema

// ============================================
// Input Types
// ============================================
export interface RawAccount {
  externalId: string;
  name: string;
  type: string;
  currency: string | undefined;
  balance: number | undefined;
  availableBalance?: number;
  IBAN?: string;
  BIC?: string;
  accountNumber?: string;
  maskedNumber?: string;
  institutionId: string;
  connectionId?: string;
}

export interface NormalizedAccount {
  externalId: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  availableBalance?: number;
  IBAN?: string;
  BIC?: string;
  accountNumber?: string;
  maskedNumber?: string;
  institutionId: string;
  connectionId?: string;
  userId: string;
}

// ============================================
// Enums (matching Prisma schema)
// Using const assertion for type safety
// ============================================
export const AccountTypes = {
  CHECKING: 'CHECKING',
  SAVINGS: 'SAVINGS',
  CREDIT_CARD: 'CREDIT_CARD',
  LOAN: 'LOAN',
  PEA: 'PEA',
  CTO: 'CTO',
  LIFE_INSURANCE: 'LIFE_INSURANCE',
  PEA_PME: 'PEA_PME',
  OTHER: 'OTHER',
} as const;

export type AccountType = (typeof AccountTypes)[keyof typeof AccountTypes];

// ============================================
// Normalization Functions
// ============================================

/**
 * Normalize account data from external source
 */
export function normalizeAccount(
  raw: RawAccount,
  userId: string
): NormalizedAccount {
  return {
    externalId: raw.externalId,
    name: raw.name.trim(),
    type: normalizeAccountType(raw.type),
    currency: normalizeCurrency(raw.currency),
    balance: normalizeAmount(raw.balance),
    availableBalance: raw.availableBalance
      ? normalizeAmount(raw.availableBalance)
      : undefined,
    IBAN: raw.IBAN ? normalizeIBAN(raw.IBAN) : undefined,
    BIC: raw.BIC ? normalizeBIC(raw.BIC) : undefined,
    accountNumber: raw.accountNumber ? normalizeAccountNumber(raw.accountNumber) : undefined,
    maskedNumber: raw.maskedNumber || maskAccountNumber(raw.accountNumber),
    institutionId: raw.institutionId,
    connectionId: raw.connectionId,
    userId,
  };
}

/**
 * Normalize account type from various formats
 */
export function normalizeAccountType(externalType: string): AccountType {
  const normalized = externalType.toLowerCase().trim();

  // French account types
  if (normalized.includes('courant') || normalized.includes('checking')) {
    return AccountTypes.CHECKING;
  }
  if (normalized.includes('epargne') || normalized.includes('savings')) {
    return AccountTypes.SAVINGS;
  }
  if (normalized.includes('carte') || normalized.includes('credit')) {
    return AccountTypes.CREDIT_CARD;
  }
  if (normalized.includes('pret') || normalized.includes('loan')) {
    return AccountTypes.LOAN;
  }
  if (normalized.includes('pea') || normalized.includes('plan epargne actions')) {
    return AccountTypes.PEA;
  }
  if (normalized.includes('cto') || normalized.includes('compte titres')) {
    return AccountTypes.CTO;
  }
  if (normalized.includes('assurance') || normalized.includes('life')) {
    return AccountTypes.LIFE_INSURANCE;
  }
  if (normalized.includes('pme')) {
    return AccountTypes.PEA_PME;
  }

  // Default mappings
  const typeMap: Record<string, AccountType> = {
    'checking': AccountTypes.CHECKING,
    'savings': AccountTypes.SAVINGS,
    'credit_card': AccountTypes.CREDIT_CARD,
    'loan': AccountTypes.LOAN,
    'pea': AccountTypes.PEA,
    'cto': AccountTypes.CTO,
    'life_insurance': AccountTypes.LIFE_INSURANCE,
    'pea_pme': AccountTypes.PEA_PME,
    'cc': AccountTypes.CHECKING,
    'sv': AccountTypes.SAVINGS,
  };

  return typeMap[normalized] ?? AccountTypes.OTHER;
}

/**
 * Normalize currency code
 */
export function normalizeCurrency(currency: string | undefined): string {
  if (!currency) return 'EUR';

  const normalized = currency.toUpperCase().trim();

  // Handle common variations
  const currencyMap: Record<string, string> = {
    'EUR': 'EUR',
    'EUR€': 'EUR',
    '€': 'EUR',
    'USD': 'USD',
    'US$': 'USD',
    '$': 'USD',
    'GBP': 'GBP',
    '£': 'GBP',
    'CHF': 'CHF',
    'JPY': 'JPY',
    'CAD': 'CAD',
    'AUD': 'AUD',
  };

  return currencyMap[normalized] || normalized;
}

/**
 * Normalize IBAN format
 */
export function normalizeIBAN(iban: string | undefined): string {
  if (!iban) return '';
  // Remove spaces and non-alphanumeric characters
  return iban.replace(/\s+/g, '').toUpperCase();
}

/**
 * Normalize BIC/SWIFT format
 */
export function normalizeBIC(bic: string | undefined): string {
  if (!bic) return '';
  // Remove spaces
  return bic.replace(/\s+/g, '').toUpperCase();
}

/**
 * Normalize account number
 */
export function normalizeAccountNumber(number: string | undefined): string {
  if (!number) return '';
  // Keep only alphanumeric characters
  return number.replace(/\s+/g, '');
}

/**
 * Mask account number (show last 4 digits)
 */
export function maskAccountNumber(number: string | undefined): string {
  if (!number) return '****0000';

  const cleanNumber = normalizeAccountNumber(number);
  if (cleanNumber.length < 4) return `****${cleanNumber}`;

  return `****${cleanNumber.slice(-4)}`;
}

/**
 * Normalize amount (handle commas, spaces, currency symbols)
 */
export function normalizeAmount(amount: number | string | undefined): number {
  if (!amount) return 0;
  if (typeof amount === 'number') return amount;

  if (typeof amount === 'string') {
    // Handle negative values in parentheses
    let clean = amount.replace(/[(]/g, '-').replace(/[)]/g, '');

    // Remove currency symbols and spaces
    clean = clean.replace(/[^\d.,-]/g, '');

    // Handle comma as decimal separator (French format)
    if (clean.includes(',') && !clean.includes('.')) {
      return parseFloat(clean.replace(',', '.'));
    }

    // Handle both comma and dot (e.g., "1.234,56")
    if (clean.includes(',') && clean.includes('.')) {
      // Remove thousands separator (dot)
      const withoutThousands = clean.replace('.', '');
      return parseFloat(withoutThousands.replace(',', '.'));
    }

    return parseFloat(clean);
  }

  return 0;
}

/**
 * Check if account is active (not closed)
 */
export function isAccountActive(account: { closedAt?: Date | null }): boolean {
  return !account.closedAt || account.closedAt > new Date();
}

/**
 * Calculate account usage ratio (balance / available)
 */
export function calculateUsageRatio(
  balance: number,
  availableBalance: number
): number {
  if (availableBalance <= 0) return 0;
  return Math.min(1, balance / availableBalance);
}
