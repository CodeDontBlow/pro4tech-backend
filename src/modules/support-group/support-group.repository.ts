import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
  ChatStatus,
  Prisma,
  Role,
  SupportLevel,
} from 'generated/prisma/client';

export type AvailableAgentRecord = {
  id: string;
  supportLevel: SupportLevel;
  canAnswer: boolean;
  user: {
    name: string;
    chatStatus: ChatStatus;
    lastSeen: Date | null;
  };
};

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

  async findActiveById(id: string) {
    return this.prisma.supportGroup.findFirst({
      where: { id, deletedAt: null, isActive: true },
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

  async findVisibleSupportGroupIdsByAgentId(agentId: string): Promise<string[]> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        agentGroups: {
          where: {
            supportGroup: {
              deletedAt: null,
              isActive: true,
            },
          },
          select: {
            supportGroupId: true,
          },
        },
      },
    });

    if (!agent) {
      return [];
    }

    return agent.agentGroups.map((group) => group.supportGroupId);
  }

  async findAvailableAgents(
    companyId: string,
    supportGroupIds?: string[],
  ): Promise<AvailableAgentRecord[]> {
    const groupFilter: Prisma.AgentGroupWhereInput = {
      supportGroup: {
        deletedAt: null,
        isActive: true,
      },
    };

    if (supportGroupIds && supportGroupIds.length > 0) {
      groupFilter.supportGroupId = { in: supportGroupIds };
    }

    return this.prisma.agent.findMany({
      where: {
        canAnswer: true,
        user: {
          role: Role.AGENT,
          companyId,
          isActive: true,
          deletedAt: null,
          chatStatus: ChatStatus.ONLINE,
        },
        agentGroups: {
          some: groupFilter,
        },
      },
      select: {
        id: true,
        supportLevel: true,
        canAnswer: true,
        user: {
          select: {
            name: true,
            chatStatus: true,
            lastSeen: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.supportGroup.update({
      where: { id },
      data,
    });
  }
}
