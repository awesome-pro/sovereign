import {
  Injectable,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import { createLogger, Logger } from 'winston';
import { configureWinston } from './winston.config.js';

@Injectable()
export class LoggerService implements NestLoggerService {
  private static instance: LoggerService;
  private logger!: Logger;  // Use non-null assertion
  private contexts: Map<string, Logger> = new Map();

  constructor() {
    // If an instance already exists, return it
    if (LoggerService.instance) {
      return LoggerService.instance;
    }

    // Initialize logger if no instance exists
    this.logger = createLogger(configureWinston());
    LoggerService.instance = this;
    return this;
  }

  setContext(context: string) {
    if (!this.contexts.has(context)) {
      const contextLogger = this.logger.child({ context });
      this.contexts.set(context, contextLogger);
    }
    return this;
  }

  getContextLogger(context?: string): Logger {
    if (!context) return this.logger;
    if (!this.contexts.has(context)) {
      this.setContext(context);
    }
    return this.contexts.get(context) || this.logger;
  }

  private formatMeta(meta: Record<string, any> = {}) {
    return {
      ...meta,
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

  fatal(message: string, meta: Record<string, any> = {}) {
    this.error(message, undefined, { ...meta, level: 'FATAL' });
  }
}
