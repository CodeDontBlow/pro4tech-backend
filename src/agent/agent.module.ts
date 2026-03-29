import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { PrismaAgentRepository } from './agent.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AgentController],
  providers: [AgentService, PrismaAgentRepository],
  exports: [AgentService],
})
export class AgentModule {}
