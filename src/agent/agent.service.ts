import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Agent } from './agent.entity';
import { PrismaAgentRepository } from './agent.repository';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentService {
  constructor(private readonly agentRepository: PrismaAgentRepository) {}

  async create(createAgentDto: CreateAgentDto) {
    const existingAgent = await this.agentRepository.findById(
      createAgentDto.agentId,
    );

    if (existingAgent) {
      throw new ConflictException(
        `Agent com id ${createAgentDto.agentId} já existe`,
      );
    }

    const userExists = await this.agentRepository.userExists(
      createAgentDto.agentId,
    );

    if (!userExists) {
      throw new NotFoundException(
        `Usuário com id ${createAgentDto.agentId} não foi encontrado`,
      );
    }

    const agent = new Agent(
      createAgentDto.agentId,
      createAgentDto.supportLevel,
      createAgentDto.canAnswer,
    );

    return this.agentRepository.create(agent);
  }

  async findAll() {
    return this.agentRepository.findAll();
  }

  async findOne(agentId: string) {
    const agent = await this.agentRepository.findById(agentId);

    if (!agent) {
      throw new NotFoundException(`Agent com id ${agentId} não foi encontrado`);
    }

    return agent;
  }

  async update(agentId: string, updateAgentDto: UpdateAgentDto) {
    const agent = await this.findOne(agentId);

    if (typeof updateAgentDto.supportLevel === 'string') {
      agent.updateSupportLevel(updateAgentDto.supportLevel);
    }

    if (typeof updateAgentDto.canAnswer === 'boolean') {
      agent.updateCanAnswer(updateAgentDto.canAnswer);
    }

    return this.agentRepository.save(agent);
  }

  async remove(agentId: string): Promise<void> {
    await this.findOne(agentId);
    await this.agentRepository.delete(agentId);
  }
}
