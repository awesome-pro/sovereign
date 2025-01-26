import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { LoggingModule } from './logging/logging.module';
import { LoggerService } from './logging/logging.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, LoggingModule],
      inject: [ConfigService, LoggerService],
      useFactory: (configService: ConfigService, logger: LoggerService) => ({
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
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
