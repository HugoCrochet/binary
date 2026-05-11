// ============================================
// Validation schemas with Zod
// ============================================
import { z } from 'zod';

// Zod cuid() requires 2-3 arguments in newer versions, use uuid instead
const cuid = () => z.string().uuid() as unknown as z.ZodString;

// ============================================
// User & Auth Schemas
// ============================================
export const UserSchema = z.object({
  id: cuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// ============================================
// Institution Schemas
// ============================================
export const InstitutionSchema = z.object({
  id: cuid(),
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  type: z.enum(['BANK', 'BROKERAGE', 'PAYMENT', 'CRYPTO', 'OTHER']),
  enabled: z.boolean().default(true),
  config: z.object({}).passthrough().optional(),
});

// ============================================
// Connection Schemas
// ============================================
export const ConnectionSchema = z.object({
  id: cuid(),
  userId: z.string(),
  institutionId: z.string(),
  status: z.enum(['PENDING', 'CONNECTED', 'EXPIRED', 'DISCONNECTED', 'ERROR']),
  createdAt: z.string().datetime(),
  lastSyncAt: z.string().datetime().nullable(),
});

// ============================================
// Account Schemas
// ============================================
export const AccountSchema = z.object({
  id: cuid(),
  connectionId: z.string(),
  institutionId: z.string(),
  userId: z.string(),
  externalId: z.string(),
  externalName: z.string().nullable(),
  name: z.string().min(1, 'Le nom du compte est requis'),
  type: z.enum([
    'CHECKING',
    'SAVINGS',
    'CREDIT_CARD',
    'LOAN',
    'PEA',
    'CTO',
    'LIFE_INSURANCE',
    'PEA_PME',
    'OTHER',
  ]),
  currency: z.string().default('EUR'),
  balance: z.number(),
  availableBalance: z.number().nullable(),
  IBAN: z.string().nullable(),
  BIC: z.string().nullable(),
  accountNumber: z.string().nullable(),
  maskedNumber: z.string().nullable(),
  createdAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
});

// ============================================
// Transaction Schemas
// ============================================
export const TransactionSchema = z.object({
  id: cuid(),
  accountId: z.string(),
  userId: z.string(),
  externalId: z.string(),
  date: z.string().datetime(),
  amount: z.number(),
  currency: z.string().default('EUR'),
  type: z.enum([
    'DEBIT',
    'CREDIT',
    'TRANSFER',
    'WITHDRAWAL',
    'DEPOSIT',
    'PAYMENT',
    'REFUND',
    'FEE',
    'INTEREST',
    'DIVIDEND',
    'OTHER',
  ]),
  category: z.string().nullable(),
  subCategory: z.string().nullable(),
  merchant: z.string().nullable(),
  description: z.string(),
  note: z.string().nullable(),
  manual: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

// ============================================
// Portfolio Schemas
// ============================================
export const PortfolioSchema = z.object({
  id: cuid(),
  connectionId: z.string().nullable(),
  accountId: z.string().nullable(),
  userId: z.string(),
  institutionId: z.string(),
  name: z.string().min(1, 'Le nom du portefeuille est requis'),
  type: z.enum(['PEA', 'CTO', 'PEA_PME', 'LIFE_INSURANCE', 'OTHER']),
  currency: z.string().default('EUR'),
  startValue: z.number(),
  currentValue: z.number(),
  totalGain: z.number(),
  totalGainPercent: z.number().nullable(),
  cashBalance: z.number(),
  cashPercent: z.number().nullable(),
  createdAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
});

// ============================================
// Holding Schemas
// ============================================
export const HoldingSchema = z.object({
  id: cuid(),
  portfolioId: z.string(),
  userId: z.string(),
  externalId: z.string(),
  isin: z.string().nullable(),
  symbol: z.string().nullable(),
  quantity: z.number(),
  averageCost: z.number(),
  currentPrice: z.number(),
  currency: z.string().default('EUR'),
  marketValue: z.number(),
  totalGain: z.number(),
  totalGainPercent: z.number().nullable(),
  lastUpdated: z.string().datetime(),
});

// ============================================
// Sync Job Schemas
// ============================================
export const SyncJobSchema = z.object({
  id: cuid(),
  userId: z.string().nullable(),
  type: z.enum([
    'BANK_ACCOUNTS',
    'INVESTMENTS',
    'ALL',
    'SNAPSHOT',
    'PRICE_UPDATE',
  ]),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL']),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
  accountsSynced: z.number().default(0),
  transactionsSynced: z.number().default(0),
  holdingsSynced: z.number().default(0),
  errorMessage: z.string().nullable(),
});
