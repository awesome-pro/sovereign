// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/auth.config';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
const requestCounts = new Map<string, { count: number; timestamp: number }>();

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',').map(ip => ip.trim())[0] ?? '';
  }

  return realIP || 'unknown';
}

function isRateLimited(request: NextRequest): boolean {
  const clientIP = getClientIP(request);
  const now = Date.now();
  const requestInfo = requestCounts.get(clientIP);

  if (!requestInfo || (now - requestInfo.timestamp) > RATE_LIMIT_WINDOW) {
    requestCounts.set(clientIP, { count: 1, timestamp: now });
    return false;
  }

  if (requestInfo.count >= MAX_REQUESTS) {
    return true;
  }

  requestInfo.count++;
  return false;
}

async function refreshSession(request: NextRequest, res: NextResponse) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;

  if (!refreshToken) {
    return handleAuthError(res, 'No refresh token found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      query: `
        mutation RefreshToken($refreshToken: String!) {
          refreshToken(refreshToken: $refreshToken) {
            accessToken
            refreshToken
            user {
              id
              name
              email
              roles {
                role {
                  name
                  permissions {
                    slug
                  }
                }
              }
            }
          }
        }
      `,
      variables: { refreshToken },
    }),
  });

  const data = await response.json();

  if (!response.ok || data.errors) {
    const error = data.errors?.[0]?.message || 'Token refresh failed';
    return handleAuthError(res, error);
  }

  const { accessToken, refreshToken: newRefreshToken } = data.data.refreshToken;

  const jsonResponse = NextResponse.json({ success: true }, { status: 200 });

  jsonResponse.cookies.set(AUTH_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  jsonResponse.cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // jsonResponse.cookies.set('')

  return jsonResponse;
}

export async function POST(request: NextRequest, response: NextResponse) {
  return refreshSession(request, response);
}

export async function GET(request: NextRequest, response: NextResponse) {
  return refreshSession(request, response);
}

function handleAuthError(res: NextResponse | Response, error: string) {
  // Create the redirect URL first
  const redirectUrl = new URL('/auth/sign-in', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  
  // Add error information to the URL if provided
  if (error) {
    redirectUrl.searchParams.set('error', encodeURIComponent(error));
  }

  // Create a new redirect response
  const redirectResponse = NextResponse.redirect(redirectUrl, {
    status: 302
  });

  // Safely clear cookies if they exist
  try {
    // Check if the original response has cookies
    if (res instanceof NextResponse && res.cookies) {
      // Try to clear the original response cookies
      try {
        res.cookies.delete(AUTH_TOKEN_KEY);
        res.cookies.delete(REFRESH_TOKEN_KEY);
      } catch (cookieError) {
        console.warn('Failed to clear cookies from original response:', cookieError);
      }
    }

    // Always clear cookies in the redirect response
    redirectResponse.cookies.delete(AUTH_TOKEN_KEY);
    redirectResponse.cookies.delete(REFRESH_TOKEN_KEY);
  } catch (cookieError) {
    // Log the error but don't throw - we still want to redirect
    console.error('Error handling cookies during auth error:', cookieError);
  }

  return redirectResponse;
}
