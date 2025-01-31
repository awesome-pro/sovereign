// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { AUTH_CONFIG, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/auth.config';

// Add buffer time to handle token expiration (30 seconds)
const TOKEN_EXPIRY_BUFFER = 30;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths
  if (shouldSkipAuth(pathname)) {
    return NextResponse.next();
  }

  // Handle authentication
  const result = await handleAuthentication(request);
  
  // Add security headers
  if (result instanceof NextResponse) {
    result.headers.set('X-Frame-Options', 'DENY');
    result.headers.set('X-Content-Type-Options', 'nosniff');
    result.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  return result;
}

function shouldSkipAuth(pathname: string): boolean {
  return (
    AUTH_CONFIG.publicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/auth/sign-in'
  );
}

async function handleAuthentication(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  // No tokens present
  if (!accessToken && !refreshToken) {
    return redirectToLogin(request);
  }

  // Handle token validation and refresh
  if (accessToken) {
    try {
      const decoded = jwtDecode<{ exp: number }>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token is about to expire
      if (decoded.exp - currentTime > TOKEN_EXPIRY_BUFFER) {
        return NextResponse.next();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
    }
  }

  // Try refresh if refresh token exists
  if (refreshToken) {
    const currentPath = request.nextUrl.pathname;
    const refreshUrl = new URL(`/api/auth/refresh?redirect=${encodeURIComponent(currentPath)}`, request.url);
    return NextResponse.redirect(refreshUrl);
  }

  return redirectToLogin(request);
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/auth/sign-in', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};