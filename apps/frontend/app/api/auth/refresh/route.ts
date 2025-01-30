import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/auth.config';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
  const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';

  if (!refreshToken) {
    console.error('Refresh token missing');
    return redirectToLogin(request, 'No refresh token found');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
              accessToken
              refreshToken
              user {
                id
                email
                status
              }
            }
          }
        `,
        variables: {
          refreshToken,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || data.errors) {
      const error = data.errors?.[0]?.message || 'Token refresh failed';
      console.error('Token refresh failed:', error);
      return redirectToLogin(request, error);
    }

    const { accessToken, refreshToken: newRefreshToken } = data.data.refreshToken;

    // Create response with redirect
    const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url));

    // Set new tokens in cookies with consistent configuration
    redirectResponse.cookies.set(AUTH_TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    redirectResponse.cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return redirectResponse;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return redirectToLogin(request, error instanceof Error ? error.message : 'Unknown error');
  }
}

function redirectToLogin(request: NextRequest, error?: string) {
  const loginUrl = new URL('/auth/sign-in', request.url);
  if (error) {
    loginUrl.searchParams.set('error', error);
  }
  
  const response = NextResponse.redirect(loginUrl);
  
  // Clear tokens on error
  response.cookies.delete(AUTH_TOKEN_KEY);
  response.cookies.delete(REFRESH_TOKEN_KEY);
  
  return response;
}
