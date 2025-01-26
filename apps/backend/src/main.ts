import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { LoggerService } from './logging/logging.service';
import { WinstonModule } from 'nest-winston';
import { configureWinston } from './logging/winston.config';

async function bootstrap() {
  // Create Winston logger instance
  const winstonLogger = WinstonModule.createLogger(configureWinston());

  // Create the NestJS application with Winston logger
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  logger.setContext('Bootstrap');

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
    ],
  });

  // Enable cookie parsing
  app.use(cookieParser());

  // Add request logging middleware
  app.use((req: any, res: any, next: () => void) => {
    const startTime = Date.now();

    // Log the incoming request
    logger.debug(`Incoming ${req.method} request to ${req.url}`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Log the response after it's sent
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.debug(`Response sent for ${req.method} ${req.url}`, {
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
  console.error('Application failed to start:', error);
  process.exit(1);
});
