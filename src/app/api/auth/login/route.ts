// ============================================
// Login API Route
// ============================================
// Handles POST /api/auth/login

import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'finance-aggregator-dev-secret';
const SINGLE_USER_EMAIL = process.env.SINGLE_USER_EMAIL || 'user@example.com';
const SINGLE_USER_PASSWORD = process.env.SINGLE_USER_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials
    if (email !== SINGLE_USER_EMAIL) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (SINGLE_USER_PASSWORD && password !== SINGLE_USER_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      { userId: 'user-1', email: SINGLE_USER_EMAIL },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      token,
    });

    response.cookies.set('finance-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
