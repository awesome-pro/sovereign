import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Permission } from '../types/auth.types.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GqlAuthGuard } from '../guards/gql-auth.guard.js';
import { RequirePermissions } from '../decorators/permissions.decorator.js';
import { PermissionsGuard } from '../guards/permissions.guard.js';
import { CreatePermissionInput, UpdatePermissionInput } from '../dto/auth.input.js';

@Resolver(() => Permission)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class PermissionResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Permission])
  @RequirePermissions('VIEW_PERMISSIONS')
  async permissions() {
    return this.prisma.permission.findMany({
      include: {
        allowedRoles: true,
      },
    });
  }

  @Query(() => Permission)
  @RequirePermissions('VIEW_PERMISSIONS')
  async permission(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
      include: {
        allowedRoles: true,
      },
    });
  }

  @Mutation(() => Permission)
  @RequirePermissions('MANAGE_PERMISSIONS')
  async createPermission(@Args('input') input: CreatePermissionInput) {
    return this.prisma.permission.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        category: input.category,
      },
      include: {
        allowedRoles: true,
      },
    });
  }

  @Mutation(() => Permission)
  @RequirePermissions('MANAGE_PERMISSIONS')
  async updatePermission(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePermissionInput,
  ) {
    return this.prisma.permission.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        category: input.category,
      },
      include: {
        allowedRoles: true,
      },
    });
  }

  @Mutation(() => Boolean)
  @RequirePermissions('MANAGE_PERMISSIONS')
  async deletePermission(@Args('id', { type: () => ID }) id: string) {
    await this.prisma.permission.delete({
      where: { id },
    });
    return true;
  }
}
