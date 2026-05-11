// ============================================
// Normalization exports
// ============================================
// Re-export selected functions, avoiding duplicate exports

// Re-export normalize-account
export {
  normalizeAccount,
  normalizeAccountType,
  normalizeCurrency,
  normalizeIBAN,
  normalizeBIC,
  normalizeAccountNumber,
  maskAccountNumber,
  normalizeAmount as normalizeAccountAmount,
  isAccountActive,
  calculateUsageRatio,
} from './normalize-account';

export type { AccountType, RawAccount, NormalizedAccount } from './normalize-account';

// Re-export normalize-transaction
export {
  normalizeTransaction,
  normalizeDate,
  normalizeAmount as normalizeTransactionAmount,
  normalizeTransactionType,
  normalizeDescription,
  categorizeTransaction,
  isIncome,
} from './normalize-transaction';

export type { TransactionType, RawTransaction, NormalizedTransaction } from './normalize-transaction';

// Re-export normalize-holding
export {
  normalizeHolding,
  normalizeDate as normalizeHoldingDate,
  normalizeAmount as normalizeHoldingAmount,
  normalizeISIN,
  normalizeSymbol,
  calculateMarketValue,
  calculateGain,
  calculateGainPercent,
  calculateCostBasis,
  isProfitable,
  isInLoss,
  classifyHoldingType,
} from './normalize-holding';

export type { RawHolding, NormalizedHolding } from './normalize-holding';
