import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Agent } from './agent.entity';

@Injectable()
export class PrismaAgentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(agent: Agent): Promise<Agent> {
    const data = await this.prisma.agent.create({
      data: {
        id: agent.getAgentId(),
        supportLevel: agent.getSupportLevel(),
        canAnswer: agent.getCanAnswer(),
      },
    });

    return this.mapToEntity(data);
  }

  async save(agent: Agent): Promise<Agent> {
    const data = await this.prisma.agent.update({
      where: { id: agent.getAgentId() },
      data: {
        supportLevel: agent.getSupportLevel(),
        canAnswer: agent.getCanAnswer(),
      },
    });

    return this.mapToEntity(data);
  }

  async findById(agentId: string): Promise<Agent | null> {
    const data = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!data) {
      return null;
    }

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Agent[]> {
    const agents = await this.prisma.agent.findMany({
      orderBy: { supportLevel: 'asc' },
    });

    return agents.map((agent) => this.mapToEntity(agent));
  }

  async delete(agentId: string): Promise<void> {
    await this.prisma.agent.delete({
      where: { id: agentId },
    });
  }

  async userExists(agentId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: agentId },
      select: { id: true },
    });

    return Boolean(user);
  }

  private mapToEntity(data: {
    id: string;
    supportLevel: string;
    canAnswer: boolean;
  }): Agent {
    return new Agent(data.id, data.supportLevel, data.canAnswer);
  }
}
