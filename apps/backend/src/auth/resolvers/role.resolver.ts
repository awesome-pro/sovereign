import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Role, Permission } from '../types/auth.types.js';
import { RoleService } from '../services/role.service.js';
import { GqlAuthGuard } from '../guards/gql-auth.guard.js';
import { PermissionsGuard } from '../guards/permissions.guard.js';
import { Permissions } from '../decorators/rbac.decorator.js';

@Resolver(() => Role)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class RoleResolver {
  constructor(private roleService: RoleService) {}

  @Mutation(() => Role)
  // @Permissions('role.007')
  async createRole(
    @Args('name') name: string,
    @Args('roleHash') roleHash: string,
    @Args('description', { nullable: true }) description?: string,
  ) {
    return this.roleService.createRole(name, roleHash, description);
  }

  @Mutation(() => Role)
  // @Permissions('role.007')
  async updateRole(
    @Args('id', { type: () => ID }) id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('description', { nullable: true }) description?: string,
  ) {
    return this.roleService.updateRole(id, name, description);
  }

  @Mutation(() => Boolean)
  // @Permissions('MANAGE_ROLES')
  async deleteRole(@Args('id', { type: () => ID }) id: string) {
    return this.roleService.deleteRole(id);
  }

  @Mutation(() => Boolean)
  // @Permissions('MANAGE_ROLES')
  async assignPermissionsToRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('permissionIds', { type: () => [ID] }) permissionIds: string[],
  ) {
    return this.roleService.assignPermissionsToRole(roleId, permissionIds);
  }

  @Mutation(() => Boolean)
  // @Permissions('role.007')
  async removePermissionsFromRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('permissionIds', { type: () => [ID] }) permissionIds: string[],
  ) {
    return this.roleService.removePermissionsFromRole(roleId, permissionIds);
  }

  @Query(() => [Permission])
  // @Permissions('role.006')
  async getRolePermissions(@Args('roleId', { type: () => ID }) roleId: string) {
    return this.roleService.getRolePermissions(roleId);
  }
}
