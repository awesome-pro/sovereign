import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import { UserSession } from '../types/auth.types.js';

// session.service.ts
@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async createSession(
    userId: string,
    ip: string,
    userAgent: string
  ): Promise<UserSession> {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    
    return this.prisma.userSession.create({
      data: {
        userId,
        refreshToken,
        ip: crypto.createHash('sha256').update(ip).digest('hex'),
        device: crypto.createHash('sha256').update(userAgent).digest('hex'),
        expiresAt: dayjs().add(7, 'days').toDate(),
      },
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { revoked: true },
    });
  }

  async validateSession(jti: string, deviceHash: string): Promise<boolean> {
    const session = await this.prisma.userSession.findUnique({
      where: { id: jti },
    });

    return !!session && 
      !session.revoked &&
      session.device === deviceHash &&
      dayjs().isBefore(session.expiresAt);
  }
}
