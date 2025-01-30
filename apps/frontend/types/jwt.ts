// types/jwt.ts
export interface UltraSecureJwtPayload {
    sub: string;          // User ID
    brn: string;          // Brokerage ID
    iss: string;          // Issuer
    sctx: {              // Security Context
      iph: string;       // IP hash
      dfp: string;       // Device fingerprint
      geo: string;       // Location code
      uah: string;       // User agent hash
    };
    rls: string[];       // Roles
    prv: string[];       // Privileges
    cnd: string[];       // Conditions
    sec: {
      mfa: boolean;      // 2FA status
      bio: boolean;      // Biometric status
      dpl: number;       // Protection level
      rsk: number;       // Risk score
    };
    jti: string;         // Token ID
    iat: number;         // Issued at
    exp: number;         // Expiration
  }