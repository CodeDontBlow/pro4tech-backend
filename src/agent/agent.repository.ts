import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { SupportLevel } from './agent.entity';


@Injectable()
export class AgentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async update(
    agentId: string,
    data: { supportLevel?: SupportLevel; canAnswer?: boolean },
  ) {
    return this.prisma.agent.update({
      where: { id: agentId },
      data: {
        ...(typeof data.supportLevel !== undefined
          ? { supportLevel: data.supportLevel }
          : {}),
        ...(typeof data.canAnswer === 'boolean'
          ? { canAnswer: data.canAnswer }
          : {}),
      },
    });
  }
}
