import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Request } from 'express';
import * as crypto from 'crypto';
import { SessionService } from '../session/session.service.js';
import { UltraSecureJwtPayload } from '../services/auth.interfaces.js';

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
    } as StrategyOptionsWithRequest)
  }

  async validate(req: Request, payload: UltraSecureJwtPayload) {
    // Device fingerprinting
    const deviceHash = this.createDeviceHash(req);
    
    // Session validation
    const valid = await this.sessionService.validateSession(
      payload.jti,
      deviceHash
    );
    
    if (!valid) throw new UnauthorizedException('Invalid session');
    
    return { 
      ...payload, 
      ipHash: crypto.createHash('sha256').update(req.ip ?? '').digest('hex'),
      deviceHash: this.createDeviceHash(req)
    };
  }
  private createDeviceHash(req: Request): string {
    const fingerprint = [
      req.headers['user-agent'],
      req.ip,
      req.headers['accept-language'],
    ].join('|');
    
    return crypto
      .createHash('sha256')
      .update(fingerprint)
      .digest('hex');
  }
}
