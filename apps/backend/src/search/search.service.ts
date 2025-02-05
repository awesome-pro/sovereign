import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchUsers(query: string, limit = 10) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      take: limit,
    });
  }

  async searchProperties(query: string, limit = 10) {
    return this.prisma.property.findMany({
      where: {
        OR: [
          { referenceNumber: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        referenceNumber: true,
        title: true,
      },
      take: limit,
    });
  }

  async searchLeads(query: string, limit = 10) {
    return this.prisma.lead.findMany({
      where: {
        OR: [
          { referenceNumber: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        referenceNumber: true,
        title: true,
      },
      take: limit,
    });
  }

  async searchDeals(query: string, limit = 10) {
    return this.prisma.deal.findMany({
      where: {
        OR: [
          { referenceNumber: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        referenceNumber: true,
        title: true,
      },
      take: limit,
    });
  }
}
