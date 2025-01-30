import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';
import { AUTH_CONFIG, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/auth.config';
import { UltraSecureJwtPayload } from './types/jwt';

// Routes that require specific permissions
const protectedRoutes = {
  '/dashboard': ['VIEW_ANALYTICS'],
  '/properties': ['VIEW_PROPERTIES'],
  '/properties/create': ['CREATE_PROPERTY'],
  '/properties/edit': ['EDIT_PROPERTY'],
  '/leads': ['VIEW_LEADS'],
  '/leads/create': ['CREATE_LEAD'],
  '/documents': ['VIEW_DOCUMENTS'],
  '/team': ['VIEW_TEAM'],
  '/settings': ['MANAGE_SETTINGS'],
  '/admin': ['MANAGE_USERS'],
} as const;

// Routes that require specific roles
const roleProtectedRoutes = {
  '/admin': ['SUPER_ADMIN', 'ADMIN'],
  '/company-settings': ['SUPER_ADMIN', 'COMPANY_ADMIN'],
} as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    AUTH_CONFIG.publicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for authentication
  const accessToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  // No tokens present - redirect to login
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL('/auth/sign-in', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // No access token but refresh token present - try refresh
  if (!accessToken && refreshToken) {
    const refreshUrl = new URL('/api/auth/refresh', request.url);
    refreshUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(refreshUrl);
  }

  try {
    // Verify access token
    const decoded = jwtDecode<UltraSecureJwtPayload>(accessToken ?? '');
    const currentTime = Math.floor(Date.now() / 1000);

    // Token expired - try refresh
    if (decoded.exp < currentTime) {
      console.log('token expired2 : ', refreshToken, accessToken);
      if (refreshToken) {
        const refreshUrl = new URL('/api/auth/refresh', request.url);
        refreshUrl.searchParams.set('redirect', pathname);
        // return NextResponse.redirect(refreshUrl);
      }
      console.log('no refresh token found2 : ', refreshToken, accessToken);
      const loginUrl = new URL('/auth/sign-in', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Add user info to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.sub);
    requestHeaders.set('x-user-roles', decoded.rls.join(','));
    requestHeaders.set('x-user-permissions', decoded.prv.join(','));

    // Check permissions and roles
    if (pathname !== '/') {  // Skip checks for home page
      // Check required permissions
      const requiredPermissions = Object.entries(protectedRoutes).find(
        ([route]) => pathname.startsWith(route)
      )?.[1];

      if (requiredPermissions) {
        const hasPermission = requiredPermissions.some(permission =>
          decoded.prv.includes(permission)
        );

        if (!hasPermission) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      // Check required roles
      const requiredRoles = Object.entries(roleProtectedRoutes).find(
        ([route]) => pathname.startsWith(route)
      )?.[1];

      if (requiredRoles) {
        const hasRole = requiredRoles.some(role =>
          decoded.rls.includes(role)
        );

        if (!hasRole) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    }

    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    console.error('Token validation failed:', error);
    
    // Try refresh if available
    if (refreshToken) {
      const refreshUrl = new URL('/api/auth/refresh', request.url);
      refreshUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(refreshUrl);
    }

    const loginUrl = new URL('/auth/sign-in', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
