// ============================================
// API Route Handler with Single User Auth
// ============================================
// Updated API helpers using simplified single-user auth

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAuth } from './auth';

// ============================================
// Response Helpers
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json<ApiResponse<T>>({
    success: true,
    data,
    message,
  });
}

export function errorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return NextResponse.json<ApiResponse<never>>({
    success: false,
    error: message,
    message,
  }, { status });
}

export function notFoundResponse(message: string = 'Resource not found'): NextResponse {
  return errorResponse(message, 404);
}

export function badRequestResponse(message: string): NextResponse {
  return errorResponse(message, 400);
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, 401);
}

// ============================================
// Request Helpers with Single User
// ============================================

export async function getSessionUser(request: NextRequest): Promise<string> {
  // In single user mode, always return the single user
  try {
    const user = requireAuth(request);
    return user.id;
  } catch {
    // Fallback to query parameter for development
    const url = new URL(request.url);
    return url.searchParams.get('userId') || 'user-1';
  }
}

export function getRequestBody<T>(request: NextRequest): Promise<T> {
  return request.json();
}

// ============================================
// Pagination Helpers
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getPaginationParams(request: Request): PaginationParams {
  const url = new URL(request.url);
  return {
    page: parseInt(url.searchParams.get('page') || '1'),
    limit: parseInt(url.searchParams.get('limit') || '20'),
    sortBy: url.searchParams.get('sortBy') || undefined,
    sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}

export function paginate<T>(
  items: T[],
  page: number,
  limit: number
): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: items.slice(start, end),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

// ============================================
// Database Query Helpers
// ============================================

/**
 * Get user's accounts
 */
export async function getUserAccounts(
  userId: string,
  options?: {
    connectionId?: string;
    includeTransactions?: boolean;
    includeHoldings?: boolean;
  }
) {
  const where: any = { userId };

  if (options?.connectionId) {
    where.connectionId = options.connectionId;
  }

  const include: any = {
    institution: true,
  };

  if (options?.includeTransactions) {
    include.transactions = { take: 10, orderBy: { date: 'desc' } };
  }

  if (options?.includeHoldings) {
    include.portfolio = {
      include: {
        holdings: {
          include: { asset: true },
          orderBy: { marketValue: 'desc' },
        },
      },
    };
  }

  return prisma.account.findMany({
    where,
    include,
    orderBy: { name: 'asc' },
  });
}

/**
 * Get user's investments (portfolios + holdings)
 */
export async function getUserInvestments(userId: string) {
  return prisma.portfolio.findMany({
    where: { userId },
    include: {
      institution: true,
      holdings: {
        include: { asset: true },
        orderBy: { marketValue: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(
  userId: string,
  options?: {
    accountId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
) {
  const where: any = { userId };

  if (options?.accountId) {
    where.accountId = options.accountId;
  }

  if (options?.startDate || options?.endDate) {
    where.date = {};
    if (options.startDate) {
      where.date.gte = options.startDate;
    }
    if (options.endDate) {
      where.date.lte = options.endDate;
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        account: { select: { name: true, type: true, maskedNumber: true } },
      },
      orderBy: { date: 'desc' },
      skip: (options?.page || 1 - 1) * (options?.limit || 20),
      take: options?.limit || 20,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions,
    pagination: {
      page: options?.page || 1,
      limit: options?.limit || 20,
      total,
      totalPages: Math.ceil(total / (options?.limit || 20)),
    },
  };
}

/**
 * Get user's daily snapshots
 */
export async function getUserSnapshots(userId: string, months: number = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return prisma.dailySnapshot.findMany({
    where: {
      userId,
      snapshotDate: { gte: startDate },
    },
    orderBy: { snapshotDate: 'asc' },
  });
}
