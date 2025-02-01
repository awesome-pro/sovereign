import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PermissionService } from './permission.service.js';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) {}

  async createRole(name: string, roleHash: string, description?: string) {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { name },
      });

      if (existingRole) {
        throw new ConflictException(`Role ${name} already exists`);
      }

      return await this.prisma.role.create({
        data: {
          name,
          description,
          roleHash,
        },
        include: {
          permissions: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error creating role ${name}:`, error);
      throw error;
    }
  }

  async updateRole(id: string, name?: string, description?: string) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new NotFoundException(`Role ${id} not found`);
      }

      if (name) {
        const existingRole = await this.prisma.role.findFirst({
          where: {
            name,
            id: { not: id },
          },
        });

        if (existingRole) {
          throw new ConflictException(`Role ${name} already exists`);
        }
      }

      return await this.prisma.role.update({
        where: { id },
        data: {
          name,
          description,
        },
        include: {
          permissions: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error updating role ${id}:`, error);
      throw error;
    }
  }

  async deleteRole(id: string) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
        include: {
          users: true,
        },
      });

      if (!role) {
        throw new NotFoundException(`Role ${id} not found`);
      }

      if (role.users.length > 0) {
        throw new ConflictException('Cannot delete role with assigned users');
      }

      await this.prisma.role.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(`Error deleting role ${id}:`, error);
      throw error;
    }
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException(`Role ${roleId} not found`);
      }

      // Verify all permissions exist
      const permissions = await this.prisma.permission.findMany({
        where: {
          id: {
            in: permissionIds,
          },
        },
      });

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('Some permissions not found');
      }

      // Update role permissions
      await this.prisma.role.update({
        where: { id: roleId },
        data: {
          permissions: {
            connect: permissionIds.map(id => ({ id })),
          },
        },
      });

      // Invalidate permissions cache for all users with this role
      const usersWithRole = await this.prisma.userRole.findMany({
        where: { roleId },
        select: { userId: true },
      });

      await Promise.all(
        usersWithRole.map(({ userId }) =>
          this.permissionService.invalidateUserPermissions(userId),
        ),
      );

      return true;
    } catch (error) {
      this.logger.error(`Error assigning permissions to role ${roleId}:`, error);
      throw error;
    }
  }

  async removePermissionsFromRole(roleId: string, permissionIds: string[]) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException(`Role ${roleId} not found`);
      }

      await this.prisma.role.update({
        where: { id: roleId },
        data: {
          permissions: {
            disconnect: permissionIds.map(id => ({ id })),
          },
        },
      });

      // Invalidate permissions cache for all users with this role
      const usersWithRole = await this.prisma.userRole.findMany({
        where: { roleId },
        select: { userId: true },
      });

      await Promise.all(
        usersWithRole.map(({ userId }) =>
          this.permissionService.invalidateUserPermissions(userId),
        ),
      );

      return true;
    } catch (error) {
      this.logger.error(`Error removing permissions from role ${roleId}:`, error);
      throw error;
    }
  }

  async getRolePermissions(roleId: string) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: true,
        },
      });

      if (!role) {
        throw new NotFoundException(`Role ${roleId} not found`);
      }

      return role.permissions;
    } catch (error) {
      this.logger.error(`Error getting permissions for role ${roleId}:`, error);
      throw error;
    }
  }
}
