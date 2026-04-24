import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { Role } from 'generated/prisma/client';
import {
  AvailableAgentMembershipRecord,
  SupportGroupRepository,
} from './support-group.repository';
import { CreateSupportGroupDto } from './dtos/create-support-group.dto';
import { UpdateSupportGroupDto } from './dtos/update-support-group.dto';
import { UserPayload } from 'src/common/decorators/auth-user.decorator';
import {
  ResponseAvailabilityGroupAgentDto,
  ResponseAvailabilityGroupDto,
  ResponseAvailableAgentsSummaryDto,
} from './dtos/response-available-agents.dto';

@Injectable()
export class SupportGroupService {
  private readonly logger = new Logger(SupportGroupService.name);

  constructor(private readonly repository: SupportGroupRepository) {}

  async create(dto: CreateSupportGroupDto) {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      this.logger.warn(`Attempt to create a duplicate group: ${dto.name}`);
      throw new ConflictException('A group with this name already exists.');
    }

    const id = uuidv7();
    return this.repository.create(id, dto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const group = await this.repository.findById(id);
    if (!group) throw new NotFoundException('Group not found.');
    return group;
  }

  async update(id: string, dto: UpdateSupportGroupDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.update(id, {
      deletedAt: new Date(),
      isActive: false,
    });
  }

  async findAvailabilitySummary(
    user: UserPayload,
    supportGroupId?: string,
  ): Promise<ResponseAvailableAgentsSummaryDto> {
    const role = this.getRole(user);

    if (role === Role.AGENT) {
      return this.findAvailabilitySummaryForAgent(user, supportGroupId);
    }

    return this.findAvailabilitySummaryForAdmin(user, supportGroupId);
  }

  private async findAvailabilitySummaryForAgent(
    user: UserPayload,
    supportGroupId?: string,
  ): Promise<ResponseAvailableAgentsSummaryDto> {
    const visibleGroupIds =
      await this.repository.findVisibleSupportGroupIdsByAgentId(user.sub);

    if (visibleGroupIds.length === 0) {
      return {
        totalUniqueAvailableAgents: 0,
        groups: [],
      };
    }

    if (supportGroupId && !visibleGroupIds.includes(supportGroupId)) {
      this.logger.warn(
        `Agent tried to list availability from unauthorized group - userId: ${user.sub}, supportGroupId: ${supportGroupId}`,
      );
      throw new ForbiddenException(
        'You do not have permission to view agents from this support group',
      );
    }

    const targetGroupIds = supportGroupId ? [supportGroupId] : visibleGroupIds;
    const availableAgentMemberships =
      await this.repository.findAvailableAgentMemberships(
      user.companyId,
      targetGroupIds,
    );

    return this.mapToAvailabilitySummaryResponse(availableAgentMemberships);
  }

  private async findAvailabilitySummaryForAdmin(
    user: UserPayload,
    supportGroupId?: string,
  ): Promise<ResponseAvailableAgentsSummaryDto> {
    if (supportGroupId) {
      const supportGroup = await this.repository.findActiveById(supportGroupId);
      if (!supportGroup) {
        throw new NotFoundException('Group not found.');
      }
    }

    const availableAgentMemberships =
      await this.repository.findAvailableAgentMemberships(
      user.companyId,
      supportGroupId ? [supportGroupId] : undefined,
    );

    return this.mapToAvailabilitySummaryResponse(availableAgentMemberships);
  }

  private mapToAvailabilitySummaryResponse(
    availableAgentMemberships: AvailableAgentMembershipRecord[],
  ): ResponseAvailableAgentsSummaryDto {
    const uniqueAgentIds = new Set<string>();
    const groupsById = new Map<string, ResponseAvailabilityGroupDto>();

    for (const membership of availableAgentMemberships) {
      uniqueAgentIds.add(membership.agent.id);

      const mappedAgent: ResponseAvailabilityGroupAgentDto = {
        agentId: membership.agent.id,
        name: membership.agent.user.name,
        supportLevel: membership.agent.supportLevel,
        canAnswer: membership.agent.canAnswer,
        chatStatus: membership.agent.user.chatStatus,
        lastSeen: membership.agent.user.lastSeen ?? undefined,
      };

      const existingGroup = groupsById.get(membership.supportGroupId);
      if (!existingGroup) {
        groupsById.set(membership.supportGroupId, {
          supportGroupId: membership.supportGroupId,
          supportGroupName: membership.supportGroupName,
          availableCount: 1,
          agents: [mappedAgent],
        });
        continue;
      }

      existingGroup.availableCount += 1;
      existingGroup.agents.push(mappedAgent);
    }

    const groups = Array.from(groupsById.values()).sort((a, b) =>
      a.supportGroupName.localeCompare(b.supportGroupName),
    );

    for (const group of groups) {
      group.agents.sort((a, b) => a.name.localeCompare(b.name));
    }

    return {
      totalUniqueAvailableAgents: uniqueAgentIds.size,
      groups,
    };
  }

  private getRole(user: UserPayload): Role {
    if (user.role === Role.AGENT) {
      return Role.AGENT;
    }

    if (user.role === Role.ADMIN) {
      return Role.ADMIN;
    }

    this.logger.warn(`Invalid user role for support-group availability: ${user.role}`);
    throw new ForbiddenException('User profile is not allowed for this operation');
  }
}
