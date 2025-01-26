import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class SecurityService {
  private readonly maxLoginAttempts: number;
  private readonly lockoutDuration: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.maxLoginAttempts = this.configService.get<number>(
      'MAX_LOGIN_ATTEMPTS',
      5,
    );
    this.lockoutDuration = this.configService.get<number>(
      'LOCKOUT_DURATION',
      30,
    ); // minutes
  }

  async checkLoginAttempts(email: string, ip: string): Promise<boolean> {
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

    return recentAttempts < this.maxLoginAttempts;
  }

  async detectSuspiciousActivity(
    userId: string,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();
    const location = geoip.lookup(ip);

    // Get user's recent successful logins
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

    // Check for suspicious patterns
    const isSuspicious = this.analyzeLoginPattern(recentLogins, {
      ip,
      location: location?.country,
      device: deviceInfo.device.model,
      browser: deviceInfo.browser.name,
    });

    if (isSuspicious) {
      await this.logSuspiciousActivity(userId, {
        ip,
        location: location?.country,
        device: deviceInfo.device.model,
        userAgent,
      });
    }

    return isSuspicious;
  }

  private analyzeLoginPattern(recentLogins: any[], currentLogin: any): boolean {
    // Implement sophisticated pattern analysis here
    // This is a basic implementation - enhance based on your needs

    if (recentLogins.length === 0) return false;

    const unusualLocation = !recentLogins.some(
      (login) => login.location === currentLogin.location,
    );

    const unusualDevice = !recentLogins.some(
      (login) => login.device === currentLogin.device,
    );

    return unusualLocation && unusualDevice;
  }

  private async logSuspiciousActivity(
    userId: string,
    details: any,
  ): Promise<void> {
    await this.prisma.securityLog.create({
      data: {
        userId,
        action: 'SUSPICIOUS_LOGIN_ATTEMPT',
        description: JSON.stringify(details),
        ip: details.ip,
        device: details.device,
        userAgent: details.userAgent,
      },
    });
  }

  async validateDeviceFingerprint(
    userId: string,
    fingerprint: string,
  ): Promise<boolean> {
    const knownDevices = await this.prisma.loginHistory.findMany({
      where: {
        userId,
        success: true,
        device: fingerprint,
      },
      distinct: ['device'],
    });

    return knownDevices.length > 0;
  }

  async updateSecurityPreferences(
    userId: string,
    preferences: any,
  ): Promise<void> {
    // Update user security preferences
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: preferences.twoFactorEnabled ?? undefined,
        // Add other security preferences as needed
      },
    });
  }
}
