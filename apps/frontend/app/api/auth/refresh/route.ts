import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/auth.config';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';

    if (!refreshToken) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($input: RefreshTokenInput!) {
            refreshToken(input: $input) {
              accessToken
              refreshToken
            }
          }
        `,
        variables: {
          input: {
            refreshToken,
          },
        },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const { accessToken, refreshToken: newRefreshToken } = data.data.refreshToken;

    // Create response with redirect
    const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url));

    // Set new tokens in cookies
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
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }
}
