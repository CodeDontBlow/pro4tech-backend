import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentRepository } from './agent.repository';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async update(agentId: string, updateAgentDto: UpdateAgentDto) {
    try {
      return await this.agentRepository.update(agentId, updateAgentDto);
    } catch {
      throw new NotFoundException(`Agent com id ${agentId} não foi encontrado`);
    }
  }
}
