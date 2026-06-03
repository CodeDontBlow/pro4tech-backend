import { Module } from '@nestjs/common';
import { PrismaModule } from '@database/prisma/prisma.module';
import { AgentStandardMessageController } from './agent-standard-message.controller';
import { AgentStandardMessageService } from './agent-standard-message.service';
import { AgentStandardMessageRepository } from './agent-standard-message.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AgentStandardMessageController],
  providers: [AgentStandardMessageService, AgentStandardMessageRepository],
})
export class AgentStandardMessageModule {}
