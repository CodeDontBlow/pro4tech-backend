import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { CreateAgentStandardMessageDto } from './dtos/create-agent-standard-message.dto';
import { UpdateAgentStandardMessageDto } from './dtos/update-agent-standard-message.dto';
import { ResponseAgentStandardMessageDto } from './dtos/response-agent-standard-message.dto';

type FindAllOptions = {
  agentId: string;
  companyId: string;
  search?: string;
  skip?: number;
  take?: number;
};

@Injectable()
export class AgentStandardMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    agentId: string,
    companyId: string,
    data: CreateAgentStandardMessageDto,
  ): Promise<ResponseAgentStandardMessageDto> {
    return this.prisma.agentStandardMessage.create({
      data: {
        id: randomUUID(),
        agentId,
        companyId,
        title: data.title,
        trigger: data.trigger,
        content: data.content,
      },
    });
  }

  findAll(options: FindAllOptions): Promise<ResponseAgentStandardMessageDto[]> {
    const { agentId, companyId, search, skip, take } = options;

    return this.prisma.agentStandardMessage.findMany({
      where: {
        agentId,
        companyId,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { trigger: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      skip,
      take,
      orderBy: {
        trigger: 'asc',
      },
    });
  }

  count(agentId: string, companyId: string, search?: string): Promise<number> {
    return this.prisma.agentStandardMessage.count({
      where: {
        agentId,
        companyId,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { trigger: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    });
  }

  findById(
    id: string,
    agentId: string,
    companyId: string,
  ): Promise<ResponseAgentStandardMessageDto | null> {
    return this.prisma.agentStandardMessage.findFirst({
      where: {
        id,
        agentId,
        companyId,
      },
    });
  }

  findByTrigger(
    agentId: string,
    trigger: string,
  ): Promise<ResponseAgentStandardMessageDto | null> {
    return this.prisma.agentStandardMessage.findUnique({
      where: {
        agentId_trigger: {
          agentId,
          trigger,
        },
      },
    });
  }

  update(
    id: string,
    data: UpdateAgentStandardMessageDto,
  ): Promise<ResponseAgentStandardMessageDto> {
    return this.prisma.agentStandardMessage.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.agentStandardMessage.delete({
      where: { id },
    });
  }
}
