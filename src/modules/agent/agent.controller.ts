import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { UpdateAgentDto } from './dtos/update-agent.dto';
import { ResponseAgentDto } from './dtos/response-agent.dto';
import { SupportLevel } from 'generated/prisma/client';
import { ResponsePaginationDto } from '@common/dtos/response-pagination.dto';

@ApiTags('agent')
@ApiBearerAuth()
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.agentService.findById(id);
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Quantidade por página',
  })
  @ApiQuery({
    name: 'supportLevel',
    required: false,
    enum: SupportLevel,
    description: 'Filtrar por nível de suporte',
  })
  @ApiQuery({
    name: 'canAnswer',
    required: false,
    type: Boolean,
    description: 'Filtrar por status de resposta',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrar por status ativo',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('supportLevel') supportLevel?: SupportLevel,
    @Query('canAnswer') canAnswer?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ResponsePaginationDto<ResponseAgentDto>> {
    return this.agentService.findAll(
      {
        supportLevel,
        canAnswer:
          canAnswer === 'true'
            ? true
            : canAnswer === 'false'
              ? false
              : undefined,
        isActive:
          isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      },
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      },
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateAgentDto: UpdateAgentDto,
  ) {
    return this.agentService.update(id, updateAgentDto);
  }
}
