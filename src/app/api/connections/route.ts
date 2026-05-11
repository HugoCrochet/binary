// ============================================
// Connection API Routes
// ============================================
// OAuth connection management for financial institutions

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { successResponse, errorResponse, badRequestResponse, getSessionUser } from '@/lib/api/helpers';

// ============================================
// GET /api/connections
// ============================================
export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const connections = await prisma.connection.findMany({
      where: { userId },
      include: {
        institution: true,
        accounts: true,
        portfolios: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// POST /api/connections
// ============================================
// Initialize OAuth flow for a new institution connection
export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUser(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { institutionId, accountId } = body;

    if (!institutionId) {
      return badRequestResponse('institutionId is required');
    }

    // TODO: Implement Enable Banking OAuth flow when API is ready
    // For now, return a placeholder response
    console.log(`OAuth flow initialized for institution ${institutionId} by user ${userId}`);

    return successResponse({
      message: 'OAuth flow initialized (Enable Banking integration pending)',
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Error initializing OAuth flow:', error);
    return errorResponse('Internal server error', 500);
  }
}
