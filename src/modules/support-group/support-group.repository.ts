import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class SupportGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(id: string, data: any) {
    return this.prisma.supportGroup.create({
      data: {
        id,
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.supportGroup.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string) {
    return this.prisma.supportGroup.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async findAll() {
    return this.prisma.supportGroup.findMany({
      where: { deletedAt: null },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.supportGroup.update({
      where: { id },
      data,
    });
  }
}
