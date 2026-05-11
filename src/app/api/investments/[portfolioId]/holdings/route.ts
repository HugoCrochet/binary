// ============================================
// Portfolio Holdings API Route
// ============================================
// Manage holdings within a portfolio

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { successResponse, errorResponse, notFoundResponse, badRequestResponse } from '@/lib/api/helpers';

// ============================================
// GET /api/investments/:id/holdings
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Check portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      return notFoundResponse('Portfolio not found');
    }

    const holdings = await prisma.holding.findMany({
      where: { portfolioId },
      include: { asset: true },
      orderBy: { marketValue: 'desc' },
    });

    return successResponse(holdings);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// POST /api/investments/:id/holdings
// ============================================
// Add a manual holding to a portfolio
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const {
      isin,
      symbol,
      quantity,
      averageCost,
      currentPrice,
      currency,
    } = body;

    if (quantity === undefined || averageCost === undefined || currentPrice === undefined) {
      return badRequestResponse('Quantity, average cost, and current price are required');
    }

    // Check portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      return notFoundResponse('Portfolio not found');
    }

    const marketValue = Number(quantity) * Number(currentPrice);
    const totalGain = marketValue - Number(quantity) * Number(averageCost);
    const totalGainPercent =
      Number(quantity) * Number(averageCost) > 0
        ? (totalGain / (Number(quantity) * Number(averageCost))) * 100
        : 0;

    const holding = await prisma.holding.create({
      data: {
        portfolioId,
        userId,
        externalId: `manual-${Date.now()}`,
        isin: isin?.toUpperCase().trim(),
        symbol: symbol?.toUpperCase().trim(),
        quantity: Number(quantity),
        averageCost: Number(averageCost),
        currentPrice: Number(currentPrice),
        currency: currency || 'EUR',
        marketValue,
        totalGain,
        totalGainPercent,
        lastUpdated: new Date(),
      },
    });

    return successResponse(holding, 'Holding added successfully');
  } catch (error) {
    console.error('Error creating holding:', error);
    return errorResponse('Internal server error', 500);
  }
}
