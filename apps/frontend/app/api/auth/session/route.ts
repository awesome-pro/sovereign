// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/auth.config';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
const requestCounts = new Map<string, { count: number; timestamp: number }>();

// Helper to get the client's IP address from the request headers.
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  if (forwardedFor) {
    return forwardedFor.split(',').map(ip => ip.trim())[0] ?? '';
  }
  return realIP || 'unknown';
}

// Enforce rate limiting per IP.
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

// Standardized error handler: clears cookies and redirects to the sign-in page.
function handleAuthError(errorMessage: string): NextResponse {
  // Construct the redirect URL (using the app URL from env or default localhost)
  const redirectUrl = new URL('/auth/sign-in', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  if (errorMessage) {
    redirectUrl.searchParams.set('error', encodeURIComponent(errorMessage));
  }
  // Create a redirect response with a 302 status.
  const redirectResponse = NextResponse.redirect(redirectUrl, { status: 302 });
  // Ensure cookies are cleared in the redirect response.
  redirectResponse.cookies.delete(AUTH_TOKEN_KEY);
  redirectResponse.cookies.delete(REFRESH_TOKEN_KEY);
  return redirectResponse;
}

// Main handler for both GET and POST requests.
async function handleRequest(request: NextRequest): Promise<NextResponse> {
  // Rate-limit check.
  if (isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Retrieve cookies (HTTP-only, secure cookies are not accessible in client JS, but available on server).
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_TOKEN_KEY)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
  console.log('accessToken', accessToken, 'refreshToken', refreshToken);
  console.log('cookieStore', cookieStore);

  // If both tokens are present & both are valid, return a 200 status with the tokens.
  if ((accessToken && refreshToken)) {
    console.log('both tokens present');
    return NextResponse.json({ isSignedIn: true }, { status: 200 });
  }

  // if only the refresh token is present, call the GraphQL endpoint to refresh the token.
  if (refreshToken) {
    console.log('only refresh token present');
    try {
      // Call your GraphQL endpoint to refresh the token.
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optionally forward the refresh token in the header or cookie as needed.
          'Cookie': `${REFRESH_TOKEN_KEY}=${refreshToken}`
        },
        // 'credentials: include' is useful when using a custom fetch; here we assume tokens are handled via cookies.
        credentials: 'include',
        body: JSON.stringify({
          query: `
            mutation RefreshToken($refreshToken: String!) {
              refreshToken(refreshToken: $refreshToken) {
                user {
                  id
                  name
                  email
                  status
                  avatar
                  emailVerified
                  phoneVerified
                  twoFactorEnabled
                  roles {
                    roleHash
                    hierarchy
                    parentRoleHash
                  }
                  permissions
                }
              }
            }
          `,
          variables: { refreshToken },
        }),
      });

      console.log('GraphQL refresh response:', response);

      // extract the cookies from the response
      const data = await response.json();
    console.log('GraphQL refresh response:', data);

    // Check for errors in response
    if (!response.ok || data.errors) {
      const error = data.errors?.[0]?.message || 'Token refresh failed';
      return handleAuthError(error);
    }

    // Get the Set-Cookie header
    const setCookieHeader = response.headers.get('set-cookie');
    if (!setCookieHeader) {
      return handleAuthError('No cookies received from server');
    }

    // Parse individual cookies from the set-cookie header
    const cookieStrings = setCookieHeader.split(', ');
    const parsedCookies: Record<string, string> = {};
    
    cookieStrings.forEach(cookieString => {
      const [fullCookie] = cookieString.split(';');
      const [name, value] = fullCookie ? fullCookie.split('=') : [];
      if (name && value) {
        parsedCookies[name] = value;
      }
    });

    // Extract the user data from the GraphQL response
    const { user } = data.data.refreshToken;

    // Create the response with user data
    const newResponse = NextResponse.json(
      { isSignedIn: true, user },
      { status: 200 }
    );

    // Set cookies in the response with the same attributes as the backend
    if (parsedCookies[AUTH_TOKEN_KEY]) {
      newResponse.headers.append('Set-Cookie', 
        `${AUTH_TOKEN_KEY}=${parsedCookies[AUTH_TOKEN_KEY]}; Max-Age=900; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
      );
    }

    if (parsedCookies[REFRESH_TOKEN_KEY]) {
      newResponse.headers.append('Set-Cookie',
        `${REFRESH_TOKEN_KEY}=${parsedCookies[REFRESH_TOKEN_KEY]}; Max-Age=604800; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
      );
    }

    return newResponse;
    } catch (error) {
      console.error('Refresh token error:', error);
      return handleAuthError('Failed to refresh token');
    }
  }

  // if neither token is present, return a 401 status.
  return handleAuthError('No valid tokens found');
}

// Export both GET and POST so that the route supports both methods.
export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleRequest(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleRequest(request);
}
