import { createParamDecorator, ExecutionContext, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CompleteUser, User } from '../types/auth.types.js';
import { isValidUser } from './utils.js';

type UserKey = keyof (User & CompleteUser);

export const CurrentUser = createParamDecorator(
  (data: UserKey | undefined, context: ExecutionContext) => {
    let user: User | CompleteUser | undefined;

    try {
      // Handle both GraphQL and REST contexts
      // if (context.getType() === 'http') {
      //   const request = context.switchToHttp().getRequest<Request>();
      //   user = request.user;
      // } else {
      const ctx = GqlExecutionContext.create(context);
      user = ctx.getContext().req.user;
      // }

      // Validate user existence
      if (!user) {
        throw new UnauthorizedException('User not found in request context');
      }

      // Validate user object structure
      if (!isValidUser(user)) {
        throw new InternalServerErrorException('Invalid user object structure');
      }

      // Return specific property if requested
      if (data) {
        // Use type assertion to handle the property access safely
        if (data in user) {
          return user[data as keyof (User | CompleteUser)];
        }
        throw new InternalServerErrorException(`Property ${String(data)} not found in user object`);
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Error processing user context');
    }
  },
);

/**
 * Helper method to check if user has specific permissions
 */
export function hasPermission(user: User | CompleteUser, requiredPermission: string): boolean {
  return user.roles.some(userRole => 
    userRole.role.permissions.some(permission => permission.name === requiredPermission)
  );
}