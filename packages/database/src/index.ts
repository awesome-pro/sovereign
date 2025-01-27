import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: [
    { level: 'query', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
};

function createPrismaClient() {
  const prisma = new PrismaClient(prismaClientOptions);
  
  // Add query logging in development
  if (process.env.NODE_ENV !== 'production') {
    prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
      console.log('Query: ' + e.query);
      console.log('Duration: ' + e.duration + 'ms');
    });
  }
  
  return prisma;
}

// Ensure we reuse the same instance in development
export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Re-export everything from @prisma/client
export * from '@prisma/client';
