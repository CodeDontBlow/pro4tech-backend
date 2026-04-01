import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaAgentRepository } from './agent.repository';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentService {
  constructor(private readonly agentRepository: PrismaAgentRepository) {}

  async update(agentId: string, updateAgentDto: UpdateAgentDto) {
    try {
      return await this.agentRepository.update(agentId, updateAgentDto);
    } catch {
      throw new NotFoundException(`Agent com id ${agentId} não foi encontrado`);
    }
  }

  async remove(agentId: string): Promise<void> {
    try {
      await this.agentRepository.delete(agentId);
    } catch {
      throw new NotFoundException(`Agent com id ${agentId} não foi encontrado`);
    }
  }
}
