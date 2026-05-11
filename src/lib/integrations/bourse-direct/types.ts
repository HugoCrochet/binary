// ============================================
// Bourse Direct Types
// ============================================
// Types for Bourse Direct scraper and data

// ============================================
// Scraping Types
// ============================================
export interface BourseDirectLoginCredentials {
  username: string;
  password: string;
}

export interface BourseDirectScrapeOptions {
  headless?: boolean;
  slowMo?: number;
  timeout?: number;
}

// ============================================
// Account Types
// ============================================
export interface BourseDirectAccount {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  availableBalance?: number;
  cash?: number;
  maskedNumber?: string;
  institutionId?: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'PEA' | 'CTO' | 'LIFE_INSURANCE' | 'OTHER';

// ============================================
// Position/holding Types
// ============================================
export interface BourseDirectPosition {
  id: string;
  isin?: string;
  symbol?: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  gain?: number;
  gainPercent?: number;
  currency: string;
  portfolioId?: string;
}

// ============================================
// Portfolio Types
// ============================================
export interface BourseDirectPortfolio {
  id: string;
  name: string;
  type: PortfolioType;
  currency: string;
  currentValue?: number;
  cashBalance?: number;
  startValue?: number;
  totalGain?: number;
  totalGainPercent?: number;
  totalValue?: number;
  holdings?: BourseDirectPosition[];
}

export type PortfolioType = 'PEA' | 'CTO' | 'LIFE_INSURANCE' | 'OTHER' | 'PEA_PME';

// ============================================
// Transaction Types
// ============================================
export interface BourseDirectTransaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  merchant?: string;
  category?: string;
  accountId?: string;
}

export type TransactionType =
  | 'DEBIT'
  | 'CREDIT'
  | 'TRANSFER'
  | 'WITHDRAWAL'
  | 'DEPOSIT'
  | 'PAYMENT'
  | 'REFUND'
  | 'FEE'
  | 'INTEREST'
  | 'DIVIDEND'
  | 'OTHER';

// ============================================
// Scraped Data Types
// ============================================
export interface ScrapeResult {
  success: boolean;
  timestamp: Date;
  accounts: BourseDirectAccount[];
  portfolios: BourseDirectPortfolio[];
  transactions: BourseDirectTransaction[];
  snapshots?: DailySnapshot[];
  warnings?: string[];
  error?: string;
}

export interface DailySnapshot {
  date: Date;
  totalAssets: number;
  totalLiabilities?: number;
  netWorth: number;
  cash: number;
  investments: number;
  breakdown?: {
    checking?: number;
    savings?: number;
    pea?: number;
    cto?: number;
    lifeInsurance?: number;
  };
}

// ============================================
// Page Element Selectors (for scraping)
// ============================================
export interface BourseDirectSelectors {
  login: {
    username: string;
    password: string;
    submit: string;
    mfaCode?: string;
  };
  accounts: {
    list: string;
    item: string;
    id?: string;
    name: string;
    balance: string;
    currency?: string;
    type?: string;
  };
  portfolios: {
    list: string;
    item: string;
    id?: string;
    name: string;
    totalValue?: string;
    cashBalance?: string;
    type?: string;
  };
  positions: {
    list: string;
    item: string;
    id?: string;
    isin?: string;
    symbol?: string;
    name: string;
    quantity: string;
    averageCost?: string;
    currentPrice?: string;
    marketValue?: string;
    gain?: string;
    gainPercent?: string;
    currency?: string;
  };
  transactions: {
    list: string;
    item: string;
    id?: string;
    date: string;
    amount: string;
    type?: string;
    description: string;
    merchant?: string;
    currency?: string;
  };
}

// Default selectors (may need adjustment based on actual website structure)
export const DEFAULT_SELECTORS: BourseDirectSelectors = {
  login: {
    username: '#login-id',
    password: '#password-id',
    submit: 'button[type="submit"]',
    mfaCode: '#mfa-code',
  },
  accounts: {
    list: '.account-list',
    item: '.account-item',
    name: '.account-name',
    balance: '.account-balance',
  },
  portfolios: {
    list: '.portfolio-list',
    item: '.portfolio-item',
    name: '.portfolio-name',
    totalValue: '.portfolio-total',
  },
  positions: {
    list: '.position-list',
    item: '.position-item',
    name: '.position-name',
    quantity: '.position-quantity',
    currentPrice: '.position-price',
    marketValue: '.position-value',
  },
  transactions: {
    list: '.transaction-list',
    item: '.transaction-item',
    date: '.transaction-date',
    amount: '.transaction-amount',
    description: '.transaction-description',
  },
};
