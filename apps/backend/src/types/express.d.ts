import { PrismaService } from '../prisma/prisma.service.js';

declare global {
  namespace Express {
    interface Request {
      prismaService: PrismaService;
    }
  }
}
