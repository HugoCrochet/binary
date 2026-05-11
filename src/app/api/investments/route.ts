// ============================================
// Investments API Routes
// ============================================
// Manage portfolios and holdings

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { successResponse, errorResponse, notFoundResponse, badRequestResponse } from '@/lib/api/helpers';
import type { Prisma } from '@prisma/client';

// ============================================
// GET /api/investments - List all portfolios
// ============================================
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const portfolios = await prisma.portfolio.findMany({
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

    // Calculate totals for each portfolio
    const portfoliosWithTotals = portfolios.map((p) => {
      const totalHoldingsValue = (p.holdings as Prisma.HoldingGetPayload<{ include: { asset: true } }>[]).reduce(
        (sum, h) => sum + Number(h.marketValue),
        0
      );
      return {
        ...p,
        totalHoldingsValue,
        totalPortfolioValue: Number(p.cashBalance) + totalHoldingsValue,
      };
    });

    return successResponse(portfoliosWithTotals);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// GET /api/investments/:id - Get portfolio by ID
// ============================================
export async function GET_PORTFOLIO(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId, userId },
      include: {
        institution: true,
        holdings: {
          include: { asset: true },
          orderBy: { marketValue: 'desc' },
        },
      },
    });

    if (!portfolio) {
      return notFoundResponse('Portfolio not found');
    }

    const totalHoldingsValue = (portfolio.holdings as Prisma.HoldingGetPayload<{ include: { asset: true } }>[]).reduce(
      (sum, h) => sum + Number(h.marketValue),
      0
    );

    return successResponse({
      ...portfolio,
      totalHoldingsValue,
      totalPortfolioValue: Number(portfolio.cashBalance) + totalHoldingsValue,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// POST /api/investments - Create portfolio
// ============================================
export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const {
      name,
      type,
      currency,
      institutionId,
      connectionId,
    } = body;

    if (!name || !type) {
      return badRequestResponse('Name and type are required');
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        name,
        type,
        currency: currency || 'EUR',
        institutionId,
        connectionId,
        userId,
        currentValue: 0,
        cashBalance: 0,
      },
    });

    return successResponse(portfolio, 'Portfolio created successfully');
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return errorResponse('Internal server error', 500);
  }
}
