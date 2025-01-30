import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, AUTH_CONFIG } from '@/config/auth.config';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();
    const cookieStore = await cookies();

    // Set access token
    cookieStore.set(AUTH_TOKEN_KEY, accessToken, {
      ...AUTH_CONFIG.cookieOptions,
    });

    // Set refresh token
    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
      ...AUTH_CONFIG.cookieOptions,
      ...AUTH_CONFIG.refreshTokenOptions,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to set session:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to set session cookies' }, 
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  
  // Clear both tokens
  cookieStore.delete(AUTH_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);

  return NextResponse.json({ success: true });
}
