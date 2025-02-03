export interface DeviceInfo {
  ip?: string;
  device?: string;
  userAgent?: string;
}

// types/jwt.ts

export interface SecurityContext {
  iph: string;        // SHA-256 hash of IP address
  dfp: string;        // Device fingerprint hash
  geo: string;        // ISO 3166-2 location code
  uah: string;        // User agent hash
}

export interface SecurityState {
  mfa: boolean;       // 2FA verified this session
  bio: boolean;       // Biometric confirmation
  dpl: number;        // Data protection level (1-5)
  rsk: number;        // Risk score (0-100)
}

export interface UltraSecureJwtPayload {
  // Core Identity
  sb: string;                                    // User ID
  b: string;                                    // Brokerage ID
  is: string;                                    // Issuer

  // Enhanced RBAC Data
  r: [string, number, string | null][]; // Compact role tuple      // Role information with hierarchy
  p: Record<string, string>;                    // Detailed permission info
  c: [string, string][];                                  // Contextual conditions

  // Security
  sc: SecurityContext;                           // Security context
  ss: SecurityState;                             // Security state

  // Token Metadata
  jti: string;                                    // Unique token ID
  iat?: number;                                   // Issued at
  exp?: number;                                   // Expiration
  nbf?: number;                                   // Not before
}