// ============================================
// Transaction Normalization
// ============================================
// Normalize transaction data from various sources to internal schema

import { normalizeCurrency } from './normalize-account';

// ============================================
// Input Types
// ============================================
export interface RawTransaction {
  externalId: string;
  date: Date | string;
  amount: number | string;
  currency: string;
  type: string;
  category?: string;
  subCategory?: string;
  merchant?: string;
  description: string;
  note?: string;
  accountId: string;
  institutionId: string;
  userId: string;
}

export interface NormalizedTransaction {
  externalId: string;
  date: Date;
  amount: number;
  currency: string;
  type: TransactionType | string;
  category?: string;
  subCategory?: string;
  merchant?: string;
  description: string;
  note?: string;
  accountId: string;
  institutionId: string;
  userId: string;
  manual?: boolean;
}

// ============================================
// Enums
// ============================================
export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  TRANSFER = 'TRANSFER',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  FEE = 'FEE',
  INTEREST = 'INTEREST',
  DIVIDEND = 'DIVIDEND',
  OTHER = 'OTHER',
}

// ============================================
// Normalization Functions
// ============================================

/**
 * Normalize transaction data from external source
 */
export function normalizeTransaction(
  raw: RawTransaction,
  manual: boolean = false
): NormalizedTransaction {
  return {
    externalId: raw.externalId,
    date: normalizeDate(raw.date),
    amount: normalizeAmount(raw.amount),
    currency: normalizeCurrency(raw.currency),
    type: normalizeTransactionType(raw.type),
    category: raw.category?.trim(),
    subCategory: raw.subCategory?.trim(),
    merchant: raw.merchant?.trim(),
    description: normalizeDescription(raw.description),
    note: raw.note?.trim(),
    accountId: raw.accountId,
    institutionId: raw.institutionId,
    userId: raw.userId,
    manual,
  };
}

/**
 * Normalize transaction date
 */
export function normalizeDate(date: Date | string | undefined): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;

  if (typeof date === 'string') {
    // For now, use built-in parser
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

/**
 * Normalize transaction amount
 */
export function normalizeAmount(amount: number | string | undefined): number {
  if (!amount) return 0;
  if (typeof amount === 'number') return amount;

  if (typeof amount === 'string') {
    // Handle negative values in parentheses
    let clean = amount.replace(/[(]/g, '-').replace(/[)]/g, '');

    // Remove currency symbols and spaces
    clean = clean.replace(/[^\d.,-]/g, '');

    // Handle comma as decimal separator
    if (clean.includes(',') && !clean.includes('.')) {
      return parseFloat(clean.replace(',', '.'));
    }

    // Handle both comma and dot
    if (clean.includes(',') && clean.includes('.')) {
      const withoutThousands = clean.replace('.', '');
      return parseFloat(withoutThousands.replace(',', '.'));
    }

    return parseFloat(clean);
  }

  return 0;
}

/**
 * Normalize transaction type from various formats
 */
export function normalizeTransactionType(externalType: string): string {
  const normalized = externalType.toLowerCase().trim();

  // French transaction types
  if (normalized.includes('virement') || normalized.includes('transfer')) {
    return 'TRANSFER';
  }
  if (normalized.includes('depot') || normalized.includes('deposit')) {
    return 'DEPOSIT';
  }
  if (normalized.includes('retrait') || normalized.includes('withdrawal')) {
    return 'WITHDRAWAL';
  }
  if (normalized.includes('payment') || normalized.includes('payement')) {
    return 'PAYMENT';
  }
  if (normalized.includes('credit') || normalized.includes('salaire')) {
    return 'CREDIT';
  }
  if (normalized.includes('debit') || normalized.includes('debit')) {
    return 'DEBIT';
  }
  if (normalized.includes('refound') || normalized.includes('remboursement')) {
    return 'REFUND';
  }
  if (normalized.includes('fee') || normalized.includes('frais')) {
    return 'FEE';
  }
  if (normalized.includes('interet') || normalized.includes('interest')) {
    return 'INTEREST';
  }
  if (normalized.includes('dividend') || normalized.includes('dividende')) {
    return 'DIVIDEND';
  }

  // Default mappings
  const typeMap: Record<string, string> = {
    'debit': 'DEBIT',
    'credit': 'CREDIT',
    'transfer': 'TRANSFER',
    'withdrawal': 'WITHDRAWAL',
    'deposit': 'DEPOSIT',
    'payment': 'PAYMENT',
    'refund': 'REFUND',
    'fee': 'FEE',
    'interest': 'INTEREST',
    'dividend': 'DIVIDEND',
    'wd': 'WITHDRAWAL',
    'dep': 'DEPOSIT',
    'xfer': 'TRANSFER',
  };

  return typeMap[normalized] || 'OTHER';
}

/**
 * Normalize transaction description
 */
export function normalizeDescription(description: string): string {
  if (!description) return 'Transaction sans description';

  // Clean up extra spaces
  return description.trim().replace(/\s+/g, ' ');
}

/**
 * Categorize transaction based on merchant/description
 */
export function categorizeTransaction(
  description: string,
  merchant?: string
): { category: string; subCategory: string } {
  const combined = `${description} ${merchant}`.toLowerCase();

  // Common categories
  const categories: Record<string, { category: string; subCategory: string }> = {
    // Food & Groceries
    'carrefour': { category: 'Alimentation', subCategory: 'Supermarché' },
    'casino': { category: 'Alimentation', subCategory: 'Supermarché' },
    'monoprix': { category: 'Alimentation', subCategory: 'Supermarché' },
    'auchan': { category: 'Alimentation', subCategory: 'Supermarché' },
    'leclerc': { category: 'Alimentation', subCategory: 'Supermarché' },
    'intermarché': { category: 'Alimentation', subCategory: 'Supermarché' },
    'couche-tard': { category: 'Alimentation', subCategory: 'Épicerie' },
    'tabac': { category: 'Alimentation', subCategory: 'Épicerie' },
    'coca': { category: 'Alimentation', subCategory: 'Boissons' },
    'starbucks': { category: 'Alimentation', subCategory: 'Café' },
    'macdo': { category: 'Alimentation', subCategory: 'Fast Food' },
    'mcdonald': { category: 'Alimentation', subCategory: 'Fast Food' },
    'burger': { category: 'Alimentation', subCategory: 'Fast Food' },

    // Transportation
    ' TOTAL': { category: 'Transport', subCategory: 'Carburant' },
    'axa': { category: 'Transport', subCategory: 'Assurance' },
    'sncf': { category: 'Transport', subCategory: 'Train' },
    'train': { category: 'Transport', subCategory: 'Train' },
    'uber': { category: 'Transport', subCategory: 'VTC' },
    'bolt': { category: 'Transport', subCategory: 'VTC' },
    'taxi': { category: 'Transport', subCategory: 'Taxi' },
    'airbnb': { category: 'Transport', subCategory: 'Hébergement' },
    'hotels': { category: 'Transport', subCategory: 'Hébergement' },

    // Utilities
    'enedis': { category: 'Logement', subCategory: 'Électricité' },
    'grdf': { category: 'Logement', subCategory: 'Gaz' },
    'edf': { category: 'Logement', subCategory: 'Électricité' },
    'sfr': { category: 'Logement', subCategory: 'Internet' },
    'orange': { category: 'Logement', subCategory: 'Internet' },
    'bbox': { category: 'Logement', subCategory: 'Téléphonie' },

    // Healthcare
    'pharmacie': { category: 'Santé', subCategory: 'Pharmacie' },
    'docteur': { category: 'Santé', subCategory: 'Médecin' },
    'hopital': { category: 'Santé', subCategory: 'Hôpital' },
    'laboratoire': { category: 'Santé', subCategory: 'Analyse' },
    'optique': { category: 'Santé', subCategory: 'Opticien' },

    // Shopping
    'amazon': { category: 'Achat', subCategory: 'Online' },
    'zem': { category: 'Achat', subCategory: 'Vêtements' },
    'zara': { category: 'Achat', subCategory: 'Vêtements' },
    'h&m': { category: 'Achat', subCategory: 'Vêtements' },
    'decathlon': { category: 'Achat', subCategory: 'Sport' },
    'fnac': { category: 'Achat', subCategory: 'Électronique' },
    'darty': { category: 'Achat', subCategory: 'Électronique' },
    'electro': { category: 'Achat', subCategory: 'Électronique' },

    // Entertainment
    'cgc': { category: 'Loisirs', subCategory: 'Cinéma' },
    'pathé': { category: 'Loisirs', subCategory: 'Cinéma' },
    'netflix': { category: 'Loisirs', subCategory: 'Streaming' },
    'spotify': { category: 'Loisirs', subCategory: 'Streaming' },
    'disney': { category: 'Loisirs', subCategory: 'Streaming' },
    'gamestop': { category: 'Loisirs', subCategory: 'Jeux vidéo' },
    'steam': { category: 'Loisirs', subCategory: 'Jeux vidéo' },

    // Services
    'impots': { category: 'Services', subCategory: 'Impôts' },
    'caf': { category: 'Services', subCategory: 'Social' },
    'laposte': { category: 'Services', subCategory: 'Courrier' },
  };

  for (const [key, value] of Object.entries(categories)) {
    if (combined.includes(key)) {
      return value;
    }
  }

  return { category: 'Autre', subCategory: 'Autre' };
}

/**
 * Determine if transaction is income or expense
 */
export function isIncome(transaction: {
  amount: number;
  type: TransactionType;
}): boolean {
  // Positive amount and credit type = income
  if (transaction.amount > 0 && transaction.type === 'CREDIT') {
    return true;
  }
  // Specific income types
  if (['CREDIT', 'DEPOSIT', 'REFUND', 'INTEREST', 'DIVIDEND'].includes(
    transaction.type
  )) {
    return transaction.amount > 0;
  }
  return false;
}
