import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateAgentDto: UpdateAgentDto,
  ) {
    return this.agentService.update(id, updateAgentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentService.remove(id);
  }
}
