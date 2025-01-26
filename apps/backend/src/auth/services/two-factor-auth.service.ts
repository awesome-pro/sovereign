import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async generateTwoFactorSecret(
    userId: string,
  ): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const secret = authenticator.generateSecret();
    const appName = this.configService.get<string>('APP_NAME', 'RealEstateCRM');
    const otpauthUrl = authenticator.keyuri(user?.email || '', appName, secret);

    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    // Store the secret temporarily until verification
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return {
      secret,
      qrCodeUrl,
    };
  }

  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      return false;
    }

    return authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });
  }

  async enableTwoFactor(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
  }

  async disableTwoFactor(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });
  }

  async validateTwoFactorAuth(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
      return true; // 2FA not required
    }

    return this.verifyTwoFactorToken(userId, token);
  }
}
