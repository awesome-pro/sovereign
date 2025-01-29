import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { AUTH_CONFIG, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from './config/auth.config';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  exp: number;
}

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

  // Allow public paths
  if (AUTH_CONFIG.publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
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

  if (!accessToken) {
    if (refreshToken) {
      // Redirect to token refresh endpoint
      const refreshUrl = new URL('/api/auth/refresh', request.url);
      refreshUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(refreshUrl);
    }

    // Redirect to login
    const loginUrl = new URL(AUTH_CONFIG.logoutRedirectPath, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify token and check permissions
    const decoded = jwtDecode<JwtPayload>(accessToken);
    const currentTime = Math.floor(Date.now() / 1000);

    // Check token expiration
    if (decoded.exp < currentTime) {
      if (refreshToken) {
        const refreshUrl = new URL('/api/auth/refresh', request.url);
        refreshUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(refreshUrl);
      }
      
      const loginUrl = new URL(AUTH_CONFIG.logoutRedirectPath, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check required permissions for the route
    const requiredPermissions = Object.entries(protectedRoutes).find(
      ([route]) => pathname.startsWith(route)
    )?.[1];

    if (requiredPermissions) {
      const hasPermission = requiredPermissions.some(permission =>
        decoded.permissions.includes(permission)
      );

      if (!hasPermission) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Check required roles for the route
    const requiredRoles = Object.entries(roleProtectedRoutes).find(
      ([route]) => pathname.startsWith(route)
    )?.[1];

    if (requiredRoles) {
      const hasRole = requiredRoles.some(role =>
        decoded.roles.includes(role)
      );

      if (!hasRole) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Add user info to headers for backend
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.sub);
    requestHeaders.set('x-user-roles', decoded.roles.join(','));
    requestHeaders.set('x-user-permissions', decoded.permissions.join(','));

    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    // Token is invalid
    const loginUrl = new URL(AUTH_CONFIG.logoutRedirectPath, request.url);
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
