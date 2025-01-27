import { PrismaService } from '../../prisma/prisma.service.js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../logging/logging.service.js';
import * as geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import type { SecurityLog, LoginHistory } from '../types/auth.types.js';

@Injectable()
export class SecurityService {
  private readonly maxLoginAttempts: number;
  private readonly lockoutDuration: number;
  private readonly logger: LoggerService;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.setContext('SecurityService');
    this.maxLoginAttempts = this.configService.get<number>(
      'MAX_LOGIN_ATTEMPTS',
      5,
    );
    this.lockoutDuration = this.configService.get<number>(
      'LOCKOUT_DURATION',
      30,
    ); // minutes
  }

  async getSecurityLogs(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<SecurityLog[]> {
    try {
      this.logger.debug('Fetching security logs', {
        userId,
        startDate,
        endDate,
      });

      const logs = await this.prisma.securityLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!logs.length) {
        this.logger.debug('No security logs found', {
          userId,
          startDate,
          endDate,
        });
      }

      return logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        action: log.action,
        description: log.description || '',
        ip: log.ip || '',
        device: log.device || '',
        userAgent: log.userAgent || '',
        createdAt: log.createdAt,
        location: geoip.lookup(log.ip ?? '')?.country || 'Unknown',
        userEmail: log.user.email,
        userName:
          `${log.user.profile?.firstName || ''} ${log.user.profile?.lastName || ''}`.trim() ||
          'Unknown',
      }));
    } catch (error) {
      this.logger.error('Error fetching security logs', error, {
        userId,
        startDate,
        endDate,
      });
      throw error;
    }
  }

  async getLoginHistory(
    userId: string,
    limit: number = 10,
  ): Promise<LoginHistory[]> {
    try {
      this.logger.debug('Fetching login history', { userId, limit });

      const history = await this.prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!history.length) {
        this.logger.debug('No login history found', { userId });
      }

      return history.map((entry) => ({
        id: entry.id,
        userId: entry.userId,
        device: entry.device || 'Unknown',
        ip: entry.ip || 'Unknown',
        location: geoip.lookup(entry.ip ?? '')?.country || 'Unknown',
        success: entry.success,
        reason: entry.reason || 'Unknown',
        createdAt: entry.createdAt,
        userEmail: entry.user.email,
      }));
    } catch (error) {
      this.logger.error('Error fetching login history', error, {
        userId,
        limit,
      });
      throw error;
    }
  }

  async checkLoginAttempts(email: string, ip: string): Promise<boolean> {
    try {
      const recentAttempts = await this.prisma.loginHistory.count({
        where: {
          user: { email },
          ip,
          success: false,
          createdAt: {
            gte: new Date(Date.now() - this.lockoutDuration * 60 * 1000),
          },
        },
      });

      const isLocked = recentAttempts >= this.maxLoginAttempts;
      if (isLocked) {
        this.logger.warn(
          'Account temporarily locked due to multiple failed attempts',
          {
            email,
            ip,
            attempts: recentAttempts,
          },
        );
      }

      return !isLocked;
    } catch (error) {
      this.logger.error('Error checking login attempts', error, { email, ip });
      throw error;
    }
  }

  async detectSuspiciousActivity(
    userId: string,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    try {
      const deviceInfo = this.parseUserAgent(userAgent);
      const location = geoip.lookup(ip);

      const recentLogins = await this.prisma.loginHistory.findMany({
        where: {
          userId,
          success: true,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      const isSuspicious = this.analyzeLoginPattern(recentLogins, {
        ip,
        location: location?.country,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
      });

      if (isSuspicious) {
        await this.logSuspiciousActivity(userId, {
          ip,
          location: location?.country,
          deviceInfo,
          userAgent,
        });
        this.logger.warn('Suspicious activity detected', {
          userId,
          ip,
          location: location?.country,
          deviceInfo,
        });
      }

      return isSuspicious;
    } catch (error) {
      this.logger.error('Error detecting suspicious activity', error, {
        userId,
        ip,
      });
      throw error;
    }
  }

  private parseUserAgent(userAgent: string | null): any {
    if (!userAgent)
      return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
      browser:
        `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
      os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
      device: result.device.model || result.device.type || 'Unknown',
    };
  }

  private analyzeLoginPattern(recentLogins: any[], currentLogin: any): boolean {
    if (recentLogins.length === 0) return false;

    const unusualLocation = !recentLogins.some(
      (login) => login.location === currentLogin.location,
    );

    const unusualDevice = !recentLogins.some(
      (login) => login.device === currentLogin.device,
    );

    const unusualBrowser = !recentLogins.some(
      (login) => login.browser === currentLogin.browser,
    );

    const suspiciousFactors = [
      unusualLocation && 'location',
      unusualDevice && 'device',
      unusualBrowser && 'browser',
    ].filter(Boolean);

    if (suspiciousFactors.length >= 2) {
      this.logger.warn('Multiple suspicious factors detected', {
        factors: suspiciousFactors,
        currentLogin,
      });
      return true;
    }

    return false;
  }

  private async logSuspiciousActivity(
    userId: string,
    details: any,
  ): Promise<void> {
    try {
      await this.prisma.securityLog.create({
        data: {
          userId,
          action: 'SUSPICIOUS_LOGIN_ATTEMPT',
          description: JSON.stringify(details),
          ip: details.ip,
          device: details.deviceInfo.device,
          userAgent: details.userAgent,
        },
      });

      this.logger.debug('Suspicious activity logged', {
        userId,
        ...details,
      });
    } catch (error) {
      this.logger.error('Error logging suspicious activity', error, {
        userId,
        details,
      });
      throw error;
    }
  }

  async validateDeviceFingerprint(
    userId: string,
    fingerprint: string,
  ): Promise<boolean> {
    try {
      const knownDevices = await this.prisma.loginHistory.findMany({
        where: {
          userId,
          success: true,
          device: fingerprint,
        },
        distinct: ['device'],
      });

      const isKnownDevice = knownDevices.length > 0;
      this.logger.debug('Device fingerprint validation', {
        userId,
        fingerprint,
        isKnownDevice,
      });

      return isKnownDevice;
    } catch (error) {
      this.logger.error('Error validating device fingerprint', error, {
        userId,
        fingerprint,
      });
      throw error;
    }
  }

  async updateSecurityPreferences(
    userId: string,
    preferences: any,
  ): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: preferences.twoFactorEnabled ?? undefined,
          // Add other security preferences as needed
        },
      });

      this.logger.debug('Security preferences updated', {
        userId,
        preferences,
      });
    } catch (error) {
      this.logger.error('Error updating security preferences', error, {
        userId,
        preferences,
      });
      throw error;
    }
  }
}
