// ============================================
// Finance Data Types
// ============================================

// ============================================
// Balance History
// ============================================
export interface BalanceHistory {
  date: string; // ISO date string
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  cash: number;
  investments: number;
  bankAccounts: number;
  pea: number;
  cto: number;
  lifeInsurance: number;
  otherInvestments: number;
}

export interface MonthlyBalance {
  month: string; // YYYY-MM
  year: number;
  startBalance: number;
  endBalance: number;
  netContributions: number;
  gains: number;
  gainsPercent: number;
}

// ============================================
// Asset Allocation
// ============================================
export interface AssetAllocation {
  category: string;
  categoryLabel: string;
  value: number;
  percent: number;
  color: string;
  icon?: string;
}

export interface AllocationByType {
  cash: number;
  cashPercent: number;
  equity: number;
  equityPercent: number;
  bond: number;
  bondPercent: number;
  other: number;
  otherPercent: number;
}

// ============================================
// Transactions
// ============================================
export interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  accountType: string;
  accountIcon?: string;
  amount: number;
  currency: string;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category: string;
  subCategory?: string;
  merchant: string;
  description: string;
  note?: string;
  manual: boolean;
  createdAt: string;
}

export interface TransactionCategory {
  name: string;
  label: string;
  color: string;
  icon?: string;
}

export interface Cashflow {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  savingsRate: number;
  byCategory: TransactionCategory[];
}

// ============================================
// Accounts & Portfolios
// ============================================
export interface AccountSummary {
  id: string;
  name: string;
  type: string;
  institutionName: string;
  institutionIcon?: string;
  balance: number;
  currency: string;
  availableBalance?: number;
  mask?: string;
  icon?: string;
}

export interface PortfolioSummary {
  id: string;
  name: string;
  type: string;
  institutionName: string;
  currentValue: number;
  startValue: number;
  totalGain: number;
  totalGainPercent: number;
  cashBalance: number;
  cashPercent: number;
  holdingsCount: number;
}

// ============================================
// Dashboard KPIs
// ============================================
export interface KPISnapshot {
  totalNetWorth: number;
  totalNetWorthLastMonth: number;
  totalNetWorthChangePercent: number;
  monthlySavings: number;
  monthlySavingsLastMonth: number;
  monthlySavingsChangePercent: number;
  remainingMonthlyBudget: number;
  remainingMonthlyBudgetLastMonth: number;
  remainingMonthlyBudgetChangePercent: number;
}

export interface KPICardData {
  label: string;
  value: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon?: string;
}

// ============================================
// Calendar Events
// ============================================
export interface CalendarEvent {
  id: string;
  date: string;
  label: string;
  institution?: string;
  type?: 'INCOME' | 'EXPENSE';
  amount?: number;
  icon?: string;
}

// ============================================
// Chart Data Interfaces
// ============================================
export interface StackedAreaData {
  date: string;
  cash: number;
  savings: number;
  pea: number;
  cto: number;
  lifeInsurance: number;
  otherInvestments: number;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface SparklineData {
  values: number[];
  current: number;
  changePercent: number;
}

// ============================================
// Budget & Spending
// ============================================
export interface BudgetCategory {
  id: string;
  name: string;
  label: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  color: string;
  icon?: string;
}

export interface MonthlyBudget {
  month: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  savingsRate: number;
  savingsGoal: number;
  categories: BudgetCategory[];
}
