import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponsePaginationDto } from '@common/dtos/response-pagination.dto';
import { UserPayload } from '@common/decorators/auth-user.decorator';
import { CreateAgentStandardMessageDto } from './dtos/create-agent-standard-message.dto';
import { UpdateAgentStandardMessageDto } from './dtos/update-agent-standard-message.dto';
import { ResponseAgentStandardMessageDto } from './dtos/response-agent-standard-message.dto';
import { AgentStandardMessageRepository } from './agent-standard-message.repository';

@Injectable()
export class AgentStandardMessageService {
  constructor(private readonly repository: AgentStandardMessageRepository) {}

  async create(
    dto: CreateAgentStandardMessageDto,
    user: UserPayload,
  ): Promise<ResponseAgentStandardMessageDto> {
    const data = this.normalizeDto(dto);
    const existing = await this.repository.findByTrigger(user.sub, data.trigger);

    if (existing) {
      throw new BadRequestException(
        `Mensagem padrao com trigger "${data.trigger}" ja existe`,
      );
    }

    return this.repository.create(user.sub, user.companyId, data);
  }

  async findAll(
    user: UserPayload,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<ResponsePaginationDto<ResponseAgentStandardMessageDto>> {
    const normalizedPage = this.normalizePage(page);
    const normalizedLimit = this.normalizeLimit(limit);
    const normalizedSearch = search?.trim();
    const skip = (normalizedPage - 1) * normalizedLimit;

    const [messages, total] = await Promise.all([
      this.repository.findAll({
        agentId: user.sub,
        companyId: user.companyId,
        search: normalizedSearch,
        skip,
        take: normalizedLimit,
      }),
      this.repository.count(user.sub, user.companyId, normalizedSearch),
    ]);

    return new ResponsePaginationDto(
      messages,
      total,
      normalizedPage,
      normalizedLimit,
    );
  }

  async findById(
    id: string,
    user: UserPayload,
  ): Promise<ResponseAgentStandardMessageDto> {
    const message = await this.repository.findById(
      id,
      user.sub,
      user.companyId,
    );

    if (!message) {
      throw new NotFoundException(`Mensagem padrao com id ${id} nao encontrada`);
    }

    return message;
  }

  async update(
    id: string,
    dto: UpdateAgentStandardMessageDto,
    user: UserPayload,
  ): Promise<ResponseAgentStandardMessageDto> {
    const existing = await this.findById(id, user);
    const data = this.normalizeDto(dto);

    if (data.trigger && data.trigger !== existing.trigger) {
      const triggerExists = await this.repository.findByTrigger(
        user.sub,
        data.trigger,
      );

      if (triggerExists) {
        throw new BadRequestException(
          `Mensagem padrao com trigger "${data.trigger}" ja existe`,
        );
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: string, user: UserPayload): Promise<void> {
    await this.findById(id, user);
    await this.repository.delete(id);
  }

  private normalizeDto<T extends { title?: string; trigger?: string; content?: string }>(
    dto: T,
  ): T {
    return {
      ...dto,
      title: dto.title?.trim(),
      trigger: dto.trigger ? this.normalizeTrigger(dto.trigger) : undefined,
      content: dto.content?.trim(),
    };
  }

  private normalizeTrigger(trigger: string): string {
    const trimmed = trigger.trim().toLowerCase();
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  private normalizePage(page: number): number {
    if (!Number.isFinite(page) || page < 1) {
      return 1;
    }

    return Math.floor(page);
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isFinite(limit) || limit < 1) {
      return 10;
    }

    return Math.min(Math.floor(limit), 100);
  }
}
