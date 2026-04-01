import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaAgentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async update(
    agentId: string,
    data: { supportLevel?: string; canAnswer?: boolean },
  ) {
    return this.prisma.agent.update({
      where: { id: agentId },
      data: {
        ...(typeof data.supportLevel === 'string'
          ? { supportLevel: data.supportLevel }
          : {}),
        ...(typeof data.canAnswer === 'boolean'
          ? { canAnswer: data.canAnswer }
          : {}),
      },
    });
  }

  async delete(agentId: string): Promise<void> {
    await this.prisma.agent.delete({
      where: { id: agentId },
    });
  }
}
