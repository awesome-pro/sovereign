// lib/tokenManager.ts
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { UltraSecureJwtPayload } from '@/types/jwt';

export class TokenManager {
  private static readonly TOKEN_CONFIG = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    domain: 'http://localhost:8000/graphql',
  };

  static setTokens(accessToken: string, refreshToken: string) {
    Cookies.set('accessToken', accessToken, {
      ...this.TOKEN_CONFIG,
      expires: 1/24, // 1 hour
    });
    
    Cookies.set('refreshToken', refreshToken, {
      ...this.TOKEN_CONFIG,
      expires: 7, // 7 days
    });
  }

  static getDecodedToken(): UltraSecureJwtPayload | null {
    debugger;
    const token = Cookies.get('accessToken');
    if (!token) return null;
    try {
      const decoded = jwtDecode<UltraSecureJwtPayload>(token);
      return decoded;
    } catch {
      return null;
    }
  }

  static clearTokens() {
    Cookies.remove('accessToken', this.TOKEN_CONFIG);
    Cookies.remove('refreshToken', this.TOKEN_CONFIG);
  }
}