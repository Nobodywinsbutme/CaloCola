import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoodsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.food.findMany();
  }

  async findById(id: string) {
    return this.prisma.food.findUnique({ where: { id } });
  }

  async search(query: string) {
    return this.prisma.food.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }
}