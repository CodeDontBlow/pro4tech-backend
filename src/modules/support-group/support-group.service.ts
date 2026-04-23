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
  AvailableAgentRecord,
  SupportGroupRepository,
} from './support-group.repository';
import { CreateSupportGroupDto } from './dtos/create-support-group.dto';
import { UpdateSupportGroupDto } from './dtos/update-support-group.dto';
import { UserPayload } from 'src/common/decorators/auth-user.decorator';
import {
  ResponseAvailableAgentDto,
  ResponseAvailableAgentsDto,
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

  async findAvailableAgents(
    user: UserPayload,
    supportGroupId?: string,
  ): Promise<ResponseAvailableAgentsDto> {
    const role = this.getRole(user);

    if (role === Role.AGENT) {
      return this.findAvailableAgentsForAgent(user, supportGroupId);
    }

    return this.findAvailableAgentsForAdmin(user, supportGroupId);
  }

  private async findAvailableAgentsForAgent(
    user: UserPayload,
    supportGroupId?: string,
  ): Promise<ResponseAvailableAgentsDto> {
    const visibleGroupIds =
      await this.repository.findVisibleSupportGroupIdsByAgentId(user.sub);

    if (visibleGroupIds.length === 0) {
      return {
        total: 0,
        agents: [],
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
    const availableAgents = await this.repository.findAvailableAgents(
      user.companyId,
      targetGroupIds,
    );

    return this.mapToAvailableAgentsResponse(availableAgents);
  }

  private async findAvailableAgentsForAdmin(
    user: UserPayload,
    supportGroupId?: string,
  ): Promise<ResponseAvailableAgentsDto> {
    if (supportGroupId) {
      const supportGroup = await this.repository.findActiveById(supportGroupId);
      if (!supportGroup) {
        throw new NotFoundException('Group not found.');
      }
    }

    const availableAgents = await this.repository.findAvailableAgents(
      user.companyId,
      supportGroupId ? [supportGroupId] : undefined,
    );

    return this.mapToAvailableAgentsResponse(availableAgents);
  }

  private mapToAvailableAgentsResponse(
    availableAgents: AvailableAgentRecord[],
  ): ResponseAvailableAgentsDto {
    const agents: ResponseAvailableAgentDto[] = availableAgents.map((agent) => ({
      agentId: agent.id,
      name: agent.user.name,
      supportLevel: agent.supportLevel,
      canAnswer: agent.canAnswer,
      chatStatus: agent.user.chatStatus,
      lastSeen: agent.user.lastSeen ?? undefined,
    }));

    return {
      total: agents.length,
      agents,
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
