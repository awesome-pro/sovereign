import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logging.service';
import { configureWinston } from './winston.config';

@Global()
@Module({
  imports: [WinstonModule.forRoot(configureWinston())],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggingModule {}
