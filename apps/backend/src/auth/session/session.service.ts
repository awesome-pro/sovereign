import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import { UserSession } from '../types/auth.types.js';
import { DeviceInfo } from '../services/auth.interfaces.js';
import * as geoip from 'geoip-lite';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly MAX_SESSIONS_PER_USER = 5;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async createSession(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<UserSession> {
    try {
      // Clean up expired sessions first
      await this.cleanupExpiredSessions(userId);

      // Check active sessions count
      const activeSessions = await this.getActiveSessions(userId);
      if (activeSessions.length >= this.MAX_SESSIONS_PER_USER) {
        // Revoke oldest session
        await this.revokeOldestSession(userId);
      }

      const refreshToken = crypto.randomBytes(64).toString('hex');
      const deviceHash = this.createDeviceHash(deviceInfo);
      const ipHash = this.hashIP(deviceInfo.ip);
      const location = deviceInfo.ip || 'Local '

      const session = await this.prisma.userSession.create({
        data: {
          userId,
          refreshToken,
          deviceHash,
          ipHash,
          location,
          userAgent: deviceInfo.userAgent,
          expiresAt: dayjs().add(7, 'days').toDate(),
          lastActivityAt: new Date(),
          securityLevel: this.calculateSecurityLevel(deviceInfo),
          riskScore: await this.calculateRiskScore(userId, deviceInfo),
        },
      });

      this.logger.debug(`Created new session for user ${userId}`);
      return session;
    } catch (error) {
      this.logger.error(`Failed to create session for user ${userId}`, error);
      throw error;
    }
  }

  async validateSession(sessionId: string, deviceInfo: DeviceInfo): Promise<boolean> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });

      if (!session) {
        this.logger.warn(`Session ${sessionId} not found`);
        return false;
      }

      if (session.revoked) {
        this.logger.warn(`Session ${sessionId} has been revoked`);
        return false;
      }

      if (dayjs().isAfter(session.expiresAt)) {
        this.logger.warn(`Session ${sessionId} has expired`);
        await this.revokeSession(sessionId);
        return false;
      }

      const currentDeviceHash = this.createDeviceHash(deviceInfo);
      if (session.deviceHash !== currentDeviceHash) {
        this.logger.warn(`Device mismatch for session ${sessionId}`);
        await this.revokeSession(sessionId);
        return false;
      }

      // Update last activity
      await this.updateSessionActivity(sessionId);

      return true;
    } catch (error) {
      this.logger.error(`Failed to validate session ${sessionId}`, error);
      return false;
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    try {
      await this.prisma.userSession.update({
        where: { id: sessionId },
        data: {
          revoked: true,
          revokedAt: new Date(),
        },
      });
      this.logger.debug(`Revoked session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to revoke session ${sessionId}`, error);
      throw error;
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    try {
      await this.prisma.userSession.updateMany({
        where: {
          userId,
          revoked: false,
        },
        data: {
          revoked: true,
          revokedAt: new Date(),
        },
      });
      this.logger.debug(`Revoked all sessions for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to revoke all sessions for user ${userId}`, error);
      throw error;
    }
  }

  private async getActiveSessions(userId: string): Promise<UserSession[]> {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  private async revokeOldestSession(userId: string): Promise<void> {
    const oldestSession = await this.prisma.userSession.findFirst({
      where: {
        userId,
        revoked: false,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (oldestSession) {
      await this.revokeSession(oldestSession.id);
    }
  }

  private async cleanupExpiredSessions(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: {
        userId,
        revoked: false,
        expiresAt: { lt: new Date() },
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  private async updateSessionActivity(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { lastActivityAt: new Date() },
    });
  }

  private createDeviceHash(deviceInfo: DeviceInfo): string {
    const fingerprint = [
      deviceInfo.userAgent,
      deviceInfo.ip,
      // Add more device fingerprinting factors here
    ].filter(Boolean).join('|');
    
    return crypto.createHash('sha256').update(fingerprint).digest('hex');
  }

  private hashIP(ip?: string): string {
    return ip ? crypto.createHash('sha256').update(ip).digest('hex') : '';
  }

  private getLocationFromIP(ip?: string): string | null {
    if (!ip) return null;
    const geo = geoip.lookup(ip);
    return geo ? `${geo.country}-${geo.region}` : null;
  }

  private calculateSecurityLevel(deviceInfo: DeviceInfo): number {
    let level = 1;
    // Implement security level calculation based on:
    // - IP reputation
    // - Device fingerprint reputation
    // - Location risk
    // - User agent legitimacy
    return level;
  }

  private async calculateRiskScore(userId: string, deviceInfo: DeviceInfo): Promise<number> {
    let score = 0;
    // Implement risk score calculation based on:
    // - User's historical behavior
    // - Suspicious activity patterns
    // - Geographic anomalies
    // - Device anomalies
    return score;
  }
}
