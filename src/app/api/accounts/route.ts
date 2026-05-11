// ============================================
// Accounts API Routes
// ============================================
// Manage bank accounts and their transactions

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/helpers';

// ============================================
// GET /api/accounts - List all accounts
// ============================================
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where: { userId },
        include: {
          institution: { select: { name: true, slug: true, type: true } },
          connection: { select: { status: true } },
          transactions: {
            take: 5,
            orderBy: { date: 'desc' },
            select: {
              id: true,
              date: true,
              amount: true,
              type: true,
              merchant: true,
              description: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.account.count({ where: { userId } }),
    ]);

    return successResponse({
      data: accounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// GET /api/accounts/:id - Get account by ID
// ============================================
export async function GET_ACCOUNT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId, userId },
      include: {
        institution: true,
        connection: true,
        transactions: {
          orderBy: { date: 'desc' },
        },
        portfolio: {
          include: { holdings: true },
        },
      },
    });

    if (!account) {
      return notFoundResponse('Account not found');
    }

    return successResponse(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// POST /api/accounts - Create account (manual)
// ============================================
export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const {
      externalId,
      name,
      type,
      currency,
      balance,
      connectionId,
      institutionId,
    } = body;

    if (!externalId || !name || !type) {
      return errorResponse('Missing required fields', 400);
    }

    const account = await prisma.account.create({
      data: {
        externalId,
        name,
        type,
        currency: currency || 'EUR',
        balance: Number(balance) || 0,
        connectionId,
        institutionId,
        userId,
      },
    });

    return successResponse(account, 'Account created successfully');
  } catch (error) {
    console.error('Error creating account:', error);
    return errorResponse('Internal server error', 500);
  }
}
