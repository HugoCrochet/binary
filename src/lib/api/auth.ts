// ============================================
// Simple Auth for Single User Mode
// ============================================
// Simplified authentication for single-user use case
// When user says "one user only", we simplify auth to just check environment config

import { cookies } from 'next/headers';
import { sign, verify, SignOptions } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'finance-aggregator-dev-secret';
const JWT_EXPIRES_IN_DAYS = 7;

// Single user mode - hardcoded user from config
const SINGLE_USER = {
  id: 'user-1',
  email: process.env.SINGLE_USER_EMAIL || 'user@example.com',
  firstName: process.env.SINGLE_USER_FIRST_NAME || 'User',
  lastName: process.env.SINGLE_USER_LAST_NAME || 'Principal',
};

/**
 * Generate a JWT token for the single user
 */
export function generateToken(): string {
  return sign(
    { userId: SINGLE_USER.id, email: SINGLE_USER.email },
    JWT_SECRET,
    { expiresIn: `${JWT_EXPIRES_IN_DAYS}d` } satisfies SignOptions
  );
}

/**
 * Verify JWT token and return user info
 */
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded.userId) {
      return { userId: decoded.userId, email: decoded.email as string };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get user from request headers/cookies
 */
export function getUserFromRequest(request: NextRequest): { id: string; email: string } | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (user) {
      return { id: user.userId, email: user.email };
    }
  }

  // Check cookie - Next.js 16 cookies() returns Promise<RequestCookies>
  // For sync code path, use the request's cookies if available
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key.trim()] = value;
      return acc;
    }, {} as Record<string, string>);
    const token = cookies['finance-token'];
    if (token) {
      const user = verifyToken(token);
      if (user) {
        return { id: user.userId, email: user.email };
      }
    }
  }

  return null;
}

/**
 * Create auth response with token cookie
 */
export function createAuthResponse(userId: string, email: string): NextResponse {
  const token = sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: `${JWT_EXPIRES_IN_DAYS}d` } satisfies SignOptions
  );

  const response = NextResponse.json({ success: true, user: SINGLE_USER });
  response.cookies.set('finance-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return response;
}

/**
 * Check if request is authenticated
 */
export function requireAuth(request: NextRequest): { id: string; email: string } {
  const user = getUserFromRequest(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
