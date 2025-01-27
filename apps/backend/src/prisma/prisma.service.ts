import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@sovereign/database';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      log: [
        { level: 'query', emit: 'stdout' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // async cleanDatabase() {
  //   if (process.env.NODE_ENV === 'production') return;

  //   // Add models in order considering foreign key constraints
  //   const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

  //   return await Promise.all(
  //     models.map((model) => this[model as keyof PrismaClient]?.deleteMany?.()),
  //   );
  // }
}
