// ============================================
// Auth API Routes - Single User Mode
// ============================================
// Simplified auth for single-user application

import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api/helpers';

const JWT_SECRET: string = process.env.JWT_SECRET || 'finance-aggregator-dev-secret';
const JWT_EXPIRES_IN_DAYS: number = 7;

// Single user config
const SINGLE_USER_EMAIL = process.env.SINGLE_USER_EMAIL || 'user@example.com';
const SINGLE_USER_FIRST_NAME = process.env.SINGLE_USER_FIRST_NAME || 'User';
const SINGLE_USER_LAST_NAME = process.env.SINGLE_USER_LAST_NAME || 'Principal';

const SINGLE_USER = {
  id: 'user-1',
  email: SINGLE_USER_EMAIL,
  firstName: SINGLE_USER_FIRST_NAME,
  lastName: SINGLE_USER_LAST_NAME,
};

// ============================================
// POST /api/auth/login
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return badRequestResponse('Email and password are required');
    }

    // For single user mode, validate against env config
    if (email !== SINGLE_USER.email) {
      return errorResponse('Invalid credentials', 401);
    }

    // In single user mode, password can be set via SINGLE_USER_PASSWORD env var
    // Or allow any password for development
    const requiredPassword = process.env.SINGLE_USER_PASSWORD;
    if (requiredPassword && password !== requiredPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = sign(
      { userId: SINGLE_USER.id, email: SINGLE_USER.email },
      JWT_SECRET,
      { expiresIn: `${JWT_EXPIRES_IN_DAYS}d` }
    );

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: SINGLE_USER.id,
        email: SINGLE_USER.email,
        firstName: SINGLE_USER.firstName,
        lastName: SINGLE_USER.lastName,
      },
      token,
    });

    response.cookies.set('finance-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// POST /api/auth/register
// ============================================
// In single user mode, registration is disabled
export async function POST_REGISTER(request: NextRequest) {
  return errorResponse('Registration is disabled in single user mode', 403);
}

// ============================================
// GET /api/auth/me
// ============================================
export async function GET_ME(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Missing or invalid token', 401);
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch {
      return errorResponse('Invalid token', 401);
    }

    // Return single user info
    return successResponse({
      id: SINGLE_USER.id,
      email: SINGLE_USER.email,
      firstName: SINGLE_USER.firstName,
      lastName: SINGLE_USER.lastName,
      createdAt: new Date('2026-01-01'),
      lastLogin: new Date(),
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================
// POST /api/auth/logout
// ============================================
export async function POST_LOGOUT(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' });

    // Clear the token cookie
    response.cookies.set('finance-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('Internal server error', 500);
  }
}
