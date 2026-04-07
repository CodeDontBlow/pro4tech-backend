import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma, SupportLevel } from 'generated/prisma/client';
import { UpdateAgentDto } from './dtos/update-agent.dto';
import { CreateAgentDto } from './dtos/create-agent.dto';

interface FindAllFilters {
  supportLevel?: SupportLevel;
  canAnswer?: boolean;
  isActive?: boolean;
}

interface PaginationParams {
  page: number;
  limit: number;
}

const AGENT_WITH_RELATIONS_INCLUDE = {
  user: true,
  agentGroups: {
    where: {
      supportGroup: {
        deletedAt: null,
      },
    },
    orderBy: {
      assignedAt: 'asc',
    },
    include: {
      supportGroup: {
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
} satisfies Prisma.AgentInclude;

@Injectable()
export class AgentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(agentId: string) {
    return this.prisma.agent.findUnique({
      where: { id: agentId },
      include: AGENT_WITH_RELATIONS_INCLUDE,
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.agent.findUnique({
      where: { id: userId },
      include: AGENT_WITH_RELATIONS_INCLUDE,
    });
  }

  async findAll(filters?: FindAllFilters, pagination?: PaginationParams) {
    const where: any = {};

    if (filters?.supportLevel) {
      where.supportLevel = filters.supportLevel;
    }

    if (filters?.canAnswer !== undefined) {
      where.canAnswer = filters.canAnswer;
    }

    if (filters?.isActive !== undefined) {
      where.user = {
        isActive: filters.isActive,
        deletedAt: null,
      };
    } else {
      // Por padrão, filtrar usuários não deletados
      where.user = {
        deletedAt: null,
      };
    }

    const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
    const take = pagination?.limit;

    const [agents, total] = await this.prisma.$transaction([
      this.prisma.agent.findMany({
        where,
        include: AGENT_WITH_RELATIONS_INCLUDE,
        skip,
        take,
        orderBy: {
          user: {
            createdAt: 'desc',
          },
        },
      }),
      this.prisma.agent.count({ where }),
    ]);

    return {
      agents,
      total,
      page: pagination?.page || 1,
      limit: pagination?.limit || total,
    };
  }

  async create(data: CreateAgentDto) {
    return this.prisma.agent.create({
      data: {
        id: data.userId,
        supportLevel: data.supportLevel,
        canAnswer: data.canAnswer,
      },
      include: AGENT_WITH_RELATIONS_INCLUDE,
    });
  }

  async update(agentId: string, data: UpdateAgentDto) {
    const updateData: any = {};

    if (data.supportLevel !== undefined) {
      updateData.supportLevel = data.supportLevel;
    }

    if (data.canAnswer !== undefined) {
      updateData.canAnswer = data.canAnswer;
    }

    if (Object.keys(updateData).length === 0) {
      return this.findById(agentId);
    }

    return this.prisma.agent.update({
      where: { id: agentId },
      data: updateData,
      include: AGENT_WITH_RELATIONS_INCLUDE,
    });
  }

  async softDelete(agentId: string) {
    // Soft delete via User (Agent tem FK em User)
    return this.prisma.user.update({
      where: { id: agentId },
      data: {
        deletedAt: new Date(),
      },
      include: {
        agent: true,
      },
    });
  }
}
