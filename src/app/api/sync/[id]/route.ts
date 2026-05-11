// ============================================
// Sync Job Detail API Route
// ============================================
// Get status and results of a sync job

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/helpers';

// ============================================
// GET /api/sync/:id
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const syncJob = await prisma.syncJob.findUnique({
      where: { id, userId },
    });

    if (!syncJob) {
      return notFoundResponse('Sync job not found');
    }

    return successResponse(syncJob);
  } catch (error) {
    console.error('Error fetching sync job:', error);
    return errorResponse('Internal server error', 500);
  }
}
