import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Redis } from 'ioredis';
import { AUTH_CONSTANTS } from '../config/auth.constants.js';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    private prisma: PrismaService,
    private redis: Redis,
  ) {}

  private getCacheKey(userId: string): string {
    return `permissions:user:${userId}`;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // Try cache first
      const cached = await this.redis.get(this.getCacheKey(userId));
      if (cached) {
        return JSON.parse(cached);
      }

      // Get from database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: true,
                }
              }
            }
          }
        }
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Extract unique permissions
      const permissions = new Set<string>();
      user.roles.forEach(userRole => 
        userRole.role.permissions.forEach(permission => 
          permissions.add(permission.code)
        )
      );

      const permissionArray = Array.from(permissions);

      // Cache results
      await this.redis.set(
        this.getCacheKey(userId),
        JSON.stringify(permissionArray),
        'EX',
        AUTH_CONSTANTS.CACHE_TTL,
      );

      return permissionArray;
    } catch (error) {
      this.logger.error(`Error getting permissions for user ${userId}:`, error);
      throw error;
    }
  }

  async invalidateUserPermissions(userId: string): Promise<void> {
    await this.redis.del(this.getCacheKey(userId));
  }
}