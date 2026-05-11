// ============================================
// Account Transactions API Route
// ============================================
// Manage transactions for a specific account

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/helpers';

// ============================================
// GET /api/accounts/:id/transactions
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const sortBy = url.searchParams.get('sortBy') || 'date';
    const sortOrder = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Check account exists and belongs to user
    const account = await prisma.account.findUnique({
      where: { id: accountId, userId },
    });

    if (!account) {
      return notFoundResponse('Account not found');
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { accountId },
        include: {
          account: { select: { name: true, type: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where: { accountId } }),
    ]);

    return successResponse({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// POST /api/accounts/:id/transactions
// ============================================
// Add a manual transaction to an account
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { date, amount, type, description, category, merchant, note } = body;

    if (!date || amount === undefined || !description) {
      return errorResponse('Date, amount, and description are required', 400);
    }

    // Check account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId, userId },
    });

    if (!account) {
      return notFoundResponse('Account not found');
    }

    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        userId,
        date: new Date(date),
        amount: Number(amount),
        currency: account.currency,
        type: type || 'OTHER',
        description,
        category,
        merchant,
        note,
        manual: true,
        externalId: `manual-${Date.now()}`,
      },
    });

    return successResponse(transaction, 'Transaction added successfully');
  } catch (error) {
    console.error('Error creating transaction:', error);
    return errorResponse('Internal server error', 500);
  }
}
