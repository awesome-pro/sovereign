import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';
import { SessionService } from '../session/session.service.js';
import { DeviceInfo, UltraSecureJwtPayload } from '../services/auth.interfaces.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.['accessToken'] || null;
        }
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: UltraSecureJwtPayload) {
    try {
      // Get device info from request
      const deviceInfo: DeviceInfo = {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        device: this.createDeviceHash(req),
      };

      // Validate session
      const isValidSession = await this.sessionService.validateSession(
        payload.jti,
        deviceInfo
      );

      if (!isValidSession) {
        throw new UnauthorizedException('Invalid session');
      }

      // Validate security context
      if (!this.validateSecurityContext(payload.sc, deviceInfo)) {
        throw new UnauthorizedException('Security context mismatch');
      }

      // Check security requirements
      if (payload.ss.mfa && !this.validateMfaRequirement(payload)) {
        throw new UnauthorizedException('MFA verification required');
      }

      // Validate contextual conditions
      if (!this.validateContextualConditions(payload.c)) {
        throw new UnauthorizedException('Contextual conditions not met');
      }

      return {
        ...payload,
        ipHash: this.hashValue(req.ip),
        deviceHash: deviceInfo.device,
      };
    } catch (error) {
      throw new UnauthorizedException('Session validation failed');
    }
  }

  private createDeviceHash(req: Request): string {
    // Use client fingerprint if available
    // console.log('req.headers', req.headers);
    // const clientFingerprint = req.headers['X-Client-Fingerprint'];
    // if (clientFingerprint) {
    //   return this.hashValue(clientFingerprint as string);
    // }

    // Fallback to traditional fingerprinting
    const fingerprint = [
      req.headers['user-agent'],
      req.ip,
      req.headers['accept-language'],
      req.headers['accept-encoding'],
      req.headers['sec-ch-ua'],
      req.headers['sec-ch-ua-platform'],
    ].filter(Boolean).join('|');
    
    return this.hashValue(fingerprint);
  }

  private hashValue(value?: string): string {
    return value ? crypto.createHash('sha256').update(value).digest('hex') : '';
  }

  private validateSecurityContext(
    context: UltraSecureJwtPayload['sc'],
    deviceInfo: DeviceInfo
  ): boolean {
    // Verify IP hasn't changed drastically (subnet level)
    const currentIpHash = this.hashValue(deviceInfo.ip);
    if (context.iph && currentIpHash.substring(0, 16) !== context.iph.substring(0, 16)) {
      return false;
    }

    // Verify device fingerprint
    // if (context.dfp && context.dfp !== deviceInfo.device) {
    //   return false;
    // }

    return true;
  }

  private validateMfaRequirement(payload: UltraSecureJwtPayload): boolean {
    // Implement MFA validation logic
    // This should check if the user has completed MFA for this session
    return true; // Placeholder
  }

  private validateContextualConditions(conditions: [string, string][]): boolean {
    // Implement contextual conditions validation
    // This should check things like time-based restrictions, location-based access, etc.
    return true; // Placeholder
  }
}
