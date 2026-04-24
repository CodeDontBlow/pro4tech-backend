import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
  ChatStatus,
  Prisma,
  Role,
  SupportLevel,
} from 'generated/prisma/client';

export type AvailableAgentMembershipRecord = {
  supportGroupId: string;
  supportGroupName: string;
  agent: {
    id: string;
    supportLevel: SupportLevel;
    canAnswer: boolean;
    user: {
      name: string;
      chatStatus: ChatStatus;
      lastSeen: Date | null;
    };
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

  async findAvailableAgentMemberships(
    companyId: string,
    supportGroupIds?: string[],
  ): Promise<AvailableAgentMembershipRecord[]> {
    const supportGroupFilter: Prisma.SupportGroupWhereInput = {
      deletedAt: null,
      isActive: true,
    };

    if (supportGroupIds && supportGroupIds.length > 0) {
      supportGroupFilter.id = { in: supportGroupIds };
    }

    const memberships = await this.prisma.agentGroup.findMany({
      where: {
        supportGroup: supportGroupFilter,
        agent: {
          canAnswer: true,
          user: {
            role: Role.AGENT,
            companyId,
            isActive: true,
            deletedAt: null,
            chatStatus: ChatStatus.ONLINE,
          },
        },
      },
      select: {
        supportGroupId: true,
        supportGroup: {
          select: {
            name: true,
          },
        },
        agent: {
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
        },
      },
    });

    return memberships.map((membership) => ({
      supportGroupId: membership.supportGroupId,
      supportGroupName: membership.supportGroup.name,
      agent: {
        id: membership.agent.id,
        supportLevel: membership.agent.supportLevel,
        canAnswer: membership.agent.canAnswer,
        user: {
          name: membership.agent.user.name,
          chatStatus: membership.agent.user.chatStatus,
          lastSeen: membership.agent.user.lastSeen,
        },
      },
    }));
  }

  async update(id: string, data: any) {
    return this.prisma.supportGroup.update({
      where: { id },
      data,
    });
  }
}
