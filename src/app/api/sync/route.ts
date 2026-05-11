// ============================================
// Sync API Routes
// ============================================
// Trigger synchronization jobs

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/helpers';

// ============================================
// GET /api/sync - List sync jobs
// ============================================
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const syncJobs = await prisma.syncJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(syncJobs);
  } catch (error) {
    console.error('Error fetching sync jobs:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// POST /api/sync - Create sync job
// ============================================
export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Create sync job record
    const syncJob = await prisma.syncJob.create({
      data: {
        userId,
        type: 'ALL',
        status: 'PENDING',
      },
    });

    return successResponse(
      { syncJobId: syncJob.id },
      'Sync job queued successfully'
    );
  } catch (error) {
    console.error('Error creating sync job:', error);
    return errorResponse('Internal server error', 500);
  }
}
