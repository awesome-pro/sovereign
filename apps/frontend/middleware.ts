import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that don't require authentication
const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication
  const accessToken = request.cookies.get('accessToken')?.value;
  
  if (!accessToken && !pathname.startsWith('/api')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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
