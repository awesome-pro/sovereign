export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_EXPIRATION: '15m',
  REFRESH_TOKEN_EXPIRATION: '7d',
  PASSWORD_RESET_EXPIRATION: '1h',
  EMAIL_VERIFICATION_EXPIRATION: '24h',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30, // minutes
  PASSWORD_HASH_ROUNDS: 12,
  CACHE_TTL: 900, // seconds
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
  CORS_OPTIONS: {
    credentials: true,
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
} as const;
