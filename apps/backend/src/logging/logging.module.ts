import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logging.service.js';
import { configureWinston } from './winston.config.js';

@Global()
@Module({
  imports: [WinstonModule.forRoot(configureWinston())],
  providers: [LoggerService],
  exports: [LoggerService, WinstonModule],
})
export class LoggingModule {}
