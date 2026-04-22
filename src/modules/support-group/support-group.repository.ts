import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SupportGroup } from 'generated/prisma/client';
import { CreateSupportGroupDto } from './dtos/create-support-group.dto';

type UpdateSupportGroupData = {
  name?: string;
  description?: string;
  isActive?: boolean;
  deletedAt?: Date | null;
};

@Injectable()
export class SupportGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(id: string, data: CreateSupportGroupDto): Promise<SupportGroup> {
    return this.prisma.supportGroup.create({
      data: {
        id,
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findById(id: string): Promise<SupportGroup | null> {
    return this.prisma.supportGroup.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string): Promise<SupportGroup | null> {
    return this.prisma.supportGroup.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
  }): Promise<SupportGroup[]> {
    const { skip, take } = params ?? {};

    return this.prisma.supportGroup.findMany({
      where: { deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return this.prisma.supportGroup.count({
      where: { deletedAt: null },
    });
  }

  async update(id: string, data: UpdateSupportGroupData): Promise<SupportGroup> {
    return this.prisma.supportGroup.update({
      where: { id },
      data,
    });
  }
}
