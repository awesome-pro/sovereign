import {
  Injectable,
  Scope,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import { createLogger, Logger } from 'winston';
import { configureWinston } from './winston.config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private logger: Logger;
  private context?: string;

  constructor() {
    this.logger = createLogger(configureWinston());
  }

  setContext(context: string) {
    this.context = context;
    return this;
  }

  private formatMeta(meta: Record<string, any> = {}) {
    return {
      ...meta,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }

  private formatError(error: unknown): Record<string, any> {
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
    }
    return { message: String(error) };
  }

  log(message: string, meta: Record<string, any> = {}) {
    this.logger.info(message, this.formatMeta(meta));
  }

  error(message: string, error?: unknown, meta: Record<string, any> = {}) {
    const errorMeta = error ? this.formatError(error) : undefined;
    this.logger.error(message, {
      ...this.formatMeta(meta),
      error: errorMeta,
    });
  }

  warn(message: string, meta: Record<string, any> = {}) {
    this.logger.warn(message, this.formatMeta(meta));
  }

  debug(message: string, meta: Record<string, any> = {}) {
    this.logger.debug(message, this.formatMeta(meta));
  }

  verbose(message: string, meta: Record<string, any> = {}) {
    this.logger.verbose(message, this.formatMeta(meta));
  }

  // Required by NestLoggerService interface
  fatal(message: string, meta: Record<string, any> = {}) {
    this.error(message, undefined, { ...meta, level: 'FATAL' });
  }
}
