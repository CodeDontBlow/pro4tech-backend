import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentRepository } from './agent.repository';
import { UpdateAgentDto } from './dtos/update-agent.dto';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { ResponseAgentDto } from './dtos/response-agent.dto';
import { SupportLevel } from 'generated/prisma/client';

interface FindAllFilters {
  supportLevel?: SupportLevel;
  canAnswer?: boolean;
  isActive?: boolean;
}

interface PaginationParams {
  page: number;
  limit: number;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(private readonly agentRepository: AgentRepository) {}

  async findById(agentId: string): Promise<ResponseAgentDto> {
    const agent = await this.agentRepository.findById(agentId);

    if (!agent || agent.user?.deletedAt) {
      this.logger.warn(`Agent not found — id: ${agentId}`);
      throw new NotFoundException(`Agent com id ${agentId} não foi encontrado`);
    }

    return this.mapToResponseDto(agent);
  }

  async findAll(
    filters?: FindAllFilters,
    pagination?: PaginationParams,
  ) {
    const result = await this.agentRepository.findAll(filters, pagination);

    return {
      agents: result.agents.map(agent => this.mapToResponseDto(agent)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async create(createAgentDto: CreateAgentDto): Promise<ResponseAgentDto> {
    try {
      const agent = await this.agentRepository.create(createAgentDto);
      this.logger.log(`Agent created — id: ${agent.id}, supportLevel: ${agent.supportLevel}`);
      return this.mapToResponseDto(agent);
    } catch (error) {
      this.logger.error(`Failed to create agent for user ${createAgentDto.userId}`, error);
      throw error;
    }
  }

  async update(agentId: string, updateAgentDto: UpdateAgentDto): Promise<ResponseAgentDto> {
    // Verificar se existe antes de atualizar
    await this.findById(agentId);

    try {
      const agent = await this.agentRepository.update(agentId, updateAgentDto);
      this.logger.log(`Agent updated — id: ${agentId}`);
      return this.mapToResponseDto(agent);
    } catch (error) {
      this.logger.error(`Failed to update agent ${agentId}`, error);
      throw new NotFoundException(`Agent com id ${agentId} não foi encontrado`);
    }
  }

  async softDelete(agentId: string): Promise<void> {
    // Verificar se existe antes de deletar
    await this.findById(agentId);

    try {
      await this.agentRepository.softDelete(agentId);
      this.logger.log(`Agent soft-deleted — id: ${agentId}`);
    } catch (error) {
      this.logger.error(`Failed to soft-delete agent ${agentId}`, error);
      throw error;
    }
  }

  private mapToResponseDto(agent: any): ResponseAgentDto {
    return {
      id: agent.id,
      supportLevel: agent.supportLevel,
      canAnswer: agent.canAnswer,
      user: {
        email: agent.user.email,
        name: agent.user.name,
        phone: agent.user.phone,
        role: agent.user.role,
        chatStatus: agent.user.chatStatus,
        lastSeen: agent.user.lastSeen,
        isActive: agent.user.isActive,
        createdAt: agent.user.createdAt,
        updatedAt: agent.user.updatedAt,
      },
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }
}
