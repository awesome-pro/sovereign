// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { UltraSecureJwtPayload } from './types/jwt';

// Public routes that don't need authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/api/auth/:path*',
];

// Routes that require specific roles and permissions

// Add buffer time to handle token expiration (30 seconds)
const TOKEN_EXPIRY_BUFFER = 30;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths and static files
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route)) ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // If no tokens present, redirect to login
  if (!accessToken && !refreshToken) {
    return redirectToLogin(request, 'no_tokens_present');
  }

  try {
    if (accessToken) {
      const decoded = jwtDecode<UltraSecureJwtPayload>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      // Check token expiration with buffer
      if (decoded.exp && decoded.exp - currentTime <= TOKEN_EXPIRY_BUFFER) {
        // Token is expired or about to expire, try refresh
        if (refreshToken) {
          return await handleRefreshToken(request, refreshToken);
        }
        return redirectToLogin(request, 'access token expired');
      }

      // Validate security context
      // const deviceInfo = await getDeviceInfo(request);
      // if (!await validateSecurityContext(decoded.sctx, deviceInfo)) {
      //   return redirectToLogin(request, 'security_context_mismatch');
      // }

      // Check route-specific security requirements
    //   for (const [route, config] of Object.entries(ROLE_PROTECTED_ROUTES)) {
    //     if (pathname.match(new RegExp(route.replace('*', '.*')))) {
    //       // Check roles
    //       const hasRequiredRole = config.roles.some(role => decoded.r.some(r => r[0] === role));
    //       if (!hasRequiredRole) {
    //         return redirectToUnauthorized(request, 'insufficient_role');
    //       }

    //       // Check permissions
    //       if (config.permissions) {
    //         const hasRequiredPermissions = config.permissions.every(
    //           permission => decoded.p.includes(permission)
    //         );
    //         if (!hasRequiredPermissions) {
    //           return redirectToUnauthorized(request, 'insufficient_permissions');
    //         }
    //       }

    //       // Check security level requirements
    //       if (config.securityLevel) {
    //         const { mfa, minDataProtectionLevel, maxRiskScore } = config.securityLevel;
            
    //         if (mfa && !decoded.ss.mfa) {
    //           return redirectToMfa(request);
    //         }

    //         if (minDataProtectionLevel && decoded.ss.dpl < minDataProtectionLevel) {
    //           return redirectToUnauthorized(request, 'insufficient_security_level');
    //         }

    //         if (maxRiskScore && decoded.ss.rsk > maxRiskScore) {
    //           return redirectToUnauthorized(request, 'high_risk_score');
    //         }
    //       }
    //     }
    //   }

      // Add security headers
      const response = NextResponse.next();
      addSecurityHeaders(response);
      return response;
    }

    // No valid access token, try refresh
    if (refreshToken) {
      return await handleRefreshToken(request, refreshToken);
    }

    return redirectToLogin(request, 'no_valid_access_token');
  } catch (error) {
    console.error('Middleware error:', error);
    return redirectToLogin(request, 'invalid_token');
  }
}

// async function getDeviceInfo(request: NextRequest) {
//   // Extract IP address
//   const ip = 
//     request.headers.get('x-forwarded-for')?.split(',')[0] || 
//     request.headers.get('x-real-ip') || 
//     'unknown';

//   // Extract user agent
//   const userAgent = request.headers.get('user-agent') || 'unknown';

//   // Create device hash
//   const device = await createDeviceHash({ ip, userAgent });

//   return {
//     ip,
//     userAgent,
//     device,
//   };
// }

// async function createDeviceHash(info: { ip: string; userAgent: string }): Promise<string> {
//   const fingerprint = [
//     info.userAgent,
//     info.ip,
//   ].filter(Boolean).join('|');
  
//   // Use Web Crypto API for hashing
//   const encoder = new TextEncoder();
//   const data = encoder.encode(fingerprint);
//   const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
//   // Convert buffer to hex string
//   return Array.from(new Uint8Array(hashBuffer))
//     .map(b => b.toString(16).padStart(2, '0'))
//     .join('');
// }

// async function validateSecurityContext(
//   context: UltraSecureJwtPayload['sc'],
//   deviceInfo: { ip?: string; device?: string; userAgent?: string }
// ): Promise<boolean> {
//   // Verify IP hasn't changed drastically (subnet level)
//   const currentIpHash = await hashSubnet(deviceInfo.ip || '');
//   if (context.iph && currentIpHash.substring(0, 16) !== context.iph.substring(0, 16)) {
//     return false;
//   }

//   // Verify device fingerprint
//   if (context.dfp && context.dfp !== deviceInfo.device) {
//     return false;
//   }

//   // Verify user agent
//   const currentUaHash = await hashString(deviceInfo.userAgent || '');
//   if (context.uah && currentUaHash !== context.uah) {
//     return false;
//   }

//   return true;
// }

async function handleRefreshToken(request: NextRequest, refreshToken: string) {
  const response = await fetch(new URL('/api/auth/session', request.url), {
    method: 'POST',
    headers: {
      'Cookie': `refreshToken=${refreshToken}`,
    },
    credentials: 'include',
  });

  if (response.redirected || !response.ok) {
    return NextResponse.redirect(response.url || request.url);
  }

  const newResponse = NextResponse.redirect(request.url);
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      newResponse.headers.append('Set-Cookie', value);
    }
  });

  return newResponse;
}

function redirectToLogin(request: NextRequest, reason?: string) {
  const url = new URL('/auth/sign-in', request.url);
  if (reason) url.searchParams.set('error', reason);
  url.searchParams.set('returnUrl', request.nextUrl.pathname);
  console.log('Redirecting to login:', url.href );
  console.log('Redirecting to login:', reason );
  // return NextResponse.redirect(url);
}

function redirectToUnauthorized(request: NextRequest, reason: string) {
  const url = new URL('/unauthorized', request.url);
  url.searchParams.set('reason', reason);
  url.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function redirectToMfa(request: NextRequest) {
  const url = new URL('/auth/mfa', request.url);
  url.searchParams.set('returnUrl', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function addSecurityHeaders(response: NextResponse) {
  // CSRF protection
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.* wss://*;"
  );
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // HSTS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};