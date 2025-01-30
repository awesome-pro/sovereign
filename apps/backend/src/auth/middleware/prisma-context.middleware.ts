import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PrismaContextMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    req.prismaService = this.prismaService;
    next();
  }
}
