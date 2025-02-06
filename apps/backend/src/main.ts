import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { LoggerService } from './logging/logging.service.js';
import { WinstonModule } from 'nest-winston';
import { configureWinston } from './logging/winston.config.js';

async function bootstrap() {
  // Create Winston logger instance for initial bootstrap
  const winstonLogger = WinstonModule.createLogger(configureWinston());

  // Create the NestJS application with Winston logger
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  const configService = app.get(ConfigService);
  const logger = new LoggerService().setContext('Bootstrap');

  // Configure CORS
  app.enableCors({
    origin: [
      'http://localhost:3000', // Next.js dev server
      'http://localhost:3001', // Next.js dev server
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Content-Type',
      'Authorization',
      'apollo-require-preflight', // Add this header
      'x-apollo-operation-name',
      'apollo-operation-name',
      'x-requested-with',
    ],
  });

  // Enable cookie parsing
  app.use(cookieParser());

  // Add request logging middleware
  app.use((req: any, res: any, next: () => void) => {
    const startTime = Date.now();
    const requestLogger = new LoggerService().setContext('HTTP');

    // Log the incoming request
    requestLogger.debug(`Incoming ${req.method} request to ${req.url}`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Log the response after it's sent
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      requestLogger.debug(`Response sent for ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  });

  const port = configService.get('PORT') || 8000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/graphql`);
}

bootstrap().catch((error) => {
  const logger = new LoggerService().setContext('Bootstrap');
  logger.error('Application failed to start', error);
  process.exit(1);
});
