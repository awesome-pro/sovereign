export interface DeviceInfo {
  ip?: string;
  device?: string;
  userAgent?: string;
}

export interface UltraSecureJwtPayload {
  // Core Identity Claims
  sub: string;          // User ID (UUIDv4)
  brn: string;          // Brokerage ID (Multi-tenancy)
  iss: string;          // Fixed Issuer
  
  // Session Security Context
  sctx: {
    iph: string;        // SHA-256 hash of IP address
    dfp: string;        // Device fingerprint hash (browser/device)
    geo: string;        // ISO 3166-2 location code (AE-DU, CH-ZH)
    uah: string;        // User agent hash
  };

  // Access Control Claims
  rls: string[];        // Role codes (e.g., ["SENIOR_BROKER", "COMPLIANCE"])
  prv: string[];        // Privilege tags (e.g., ["VIP_ACCESS", "OFFMARKET_VIEW"])
  cnd: string[];        // Contextual conditions (e.g., ["MAX_VALUE:10000000"])

  // Security State
  sec: {
    mfa: boolean;       // 2FA verified this session
    bio: boolean;       // Biometric confirmation
    dpl: number;        // Data protection level (1-5)
    rsk: number;        // Risk score (0-100)
  };

  // Token Metadata
  jti: string;          // Unique token ID (for blacklisting)
  iat?: number;         // Issued at timestamp (auto-generated)
  exp?: number;         // Short expiration (auto-generated)
  nbf?: number;         // Not before (for future-dated tokens)
}
