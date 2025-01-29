import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
          formatError: (error: any) => {
            logger.error('GraphQL Error', error);

            // Return a sanitized error message in production
            if (process.env.NODE_ENV === 'production') {
              return new Error('Internal server error');
            }
            return error;
          },
        };
      },
    }),
    AuthModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, {
    provide: APP_GUARD,
    useClass: PermissionsGuard,
  }],
})
export class AppModule {}
