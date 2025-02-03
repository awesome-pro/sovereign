import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { LoggingModule } from './logging/logging.module.js';
import { LoggerService } from './logging/logging.service.js';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './auth/guards/permissions.guard.js';
import { TaskModule } from './tasks/task.module.js';
import { JwtModule } from '@nestjs/jwt';
import { StorageModule } from './storage/storage.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { UploadScalar } from './common/scalars/upload.scalar.js';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { Request, Response, NextFunction } from 'express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          issuer: configService.get<string>('JWT_ISSUER') || 'crm-uhnw',
        },
      }),
      inject: [ConfigService],
    }),
    LoggingModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new LoggerService().setContext('GraphQL');

        return {
          autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
          sortSchema: true,
          playground: true,
          debug: configService.get('NODE_ENV') !== 'production',
          cors: false, // We handle CORS at the app level
          context: ({ req, res }: any) => ({ req, res }),
          uploads: false, // Disable Apollo Server's built-in upload handling
          buildSchemaOptions: {
            numberScalarMode: 'integer',
            dateScalarMode: 'timestamp',
          },
          formatError: (error: any) => {
            // Define standard error codes
            const errorCodes = {
              UNAUTHENTICATED: 'UNAUTHENTICATED',
              FORBIDDEN: 'FORBIDDEN',
              SECURITY_LEVEL_INSUFFICIENT: 'SECURITY_LEVEL_INSUFFICIENT',
              VALIDATION_ERROR: 'VALIDATION_ERROR',
              NOT_FOUND: 'NOT_FOUND',
              INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
            };

            // Map error types to standard codes
            let errorCode = error.extensions?.code || 'UNKNOWN_ERROR';
            if (error.message.includes('Authentication required')) {
              errorCode = errorCodes.UNAUTHENTICATED;
            } else if (error.message.includes('Forbidden')) {
              errorCode = errorCodes.FORBIDDEN;
            }

            const errorDetails = {
              message: error.message,
              code: errorCode,
              path: error.path?.join('.'),
              locations: error.locations,
              extensions: {
                code: errorCode,
                ...error.extensions,
              },
              stacktrace: error.extensions?.exception?.stacktrace,
              originalError: error.originalError?.message,
            };

            logger.error('GraphQL Error', {
              error: JSON.stringify(errorDetails, null, 2),
              context: {
                operation: error.path?.[0],
                variables: error.extensions?.variables,
                query: error.extensions?.query,
              }
            });

            // Return a sanitized error for production
            if (process.env.NODE_ENV === 'production') {
              return {
                message: errorDetails.message,
                extensions: {
                  code: errorDetails.code,
                  path: errorDetails.path,
                }
              };
            }

            // Return detailed error for development
            return {
              message: errorDetails.message,
              extensions: {
                code: errorDetails.code,
                path: errorDetails.path,
                locations: errorDetails.locations,
                stack: errorDetails.stacktrace,
                originalError: errorDetails.originalError,
              }
            };
          },
        };
      },
    }),
    AuthModule,
    TaskModule,
    StorageModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    UploadScalar,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        graphqlUploadExpress({
          maxFileSize: 10000000, // 10 MB
          maxFiles: 5,
        }),
      )
      .forRoutes('graphql');
  }
}
