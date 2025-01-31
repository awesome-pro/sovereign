import { NextRequest, NextResponse } from 'next/server';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, AUTH_CONFIG } from '@/config/auth.config';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get(AUTH_TOKEN_KEY)?.value;
    let refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
    
    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Missing required tokens' },
        { status: 400 }
      );
    }

    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Set access token with shorter expiry
    response.cookies.set(AUTH_TOKEN_KEY, accessToken, {
      ...AUTH_CONFIG.cookieOptions,
      maxAge: 15 * 60, // 15 minutes
    });

    // Set refresh token with longer expiry
    response.cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      ...AUTH_CONFIG.cookieOptions,
      maxAge: AUTH_CONFIG.refreshTokenOptions.maxAge,
    });

    // Set security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  } catch (error) {
    console.error('Failed to set session:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to set session cookies' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });

    // Clear tokens by setting empty value and immediate expiry
    response.cookies.set(AUTH_TOKEN_KEY, '', {
      ...AUTH_CONFIG.cookieOptions,
      maxAge: 0,
    });
    response.cookies.set(REFRESH_TOKEN_KEY, '', {
      ...AUTH_CONFIG.cookieOptions,
      maxAge: 0,
    });

    // Set security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  } catch (error) {
    console.error('Failed to clear session:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear session cookies' },
      { status: 500 }
    );
  }
}
