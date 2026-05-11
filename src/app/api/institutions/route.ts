// ============================================
// Institution API Routes
// ============================================
// Manage financial institutions

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api/helpers';

// ============================================
// GET /api/institutions - List all institutions
// ============================================
export async function GET(request: NextRequest) {
  try {
    const institutions = await prisma.institution.findMany({
      where: { enabled: true },
      orderBy: { name: 'asc' },
    });

    return successResponse(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// GET /api/institutions/:id - Get institution by ID
// ============================================
export async function GET_INSTITUTION(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const institution = await prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      return errorResponse('Institution not found', 404);
    }

    return successResponse(institution);
  } catch (error) {
    console.error('Error fetching institution:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// POST /api/institutions - Create institution (Admin)
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, type, config } = body;

    if (!name || !slug || !type) {
      return badRequestResponse('Name, slug, and type are required');
    }

    const institution = await prisma.institution.create({
      data: {
        name,
        slug,
        type,
        config: config || {},
      },
    });

    return successResponse(institution, 'Institution created successfully');
  } catch (error) {
    console.error('Error creating institution:', error);
    return errorResponse('Internal server error', 500);
  }
}
