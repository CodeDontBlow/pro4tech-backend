import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'generated/prisma/client';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import {
  AuthUser,
  UserPayload,
} from '@common/decorators/auth-user.decorator';
import { AgentStandardMessageService } from './agent-standard-message.service';
import { CreateAgentStandardMessageDto } from './dtos/create-agent-standard-message.dto';
import { UpdateAgentStandardMessageDto } from './dtos/update-agent-standard-message.dto';
import { ResponseAgentStandardMessageDto } from './dtos/response-agent-standard-message.dto';
import { ResponsePaginationDto } from '@common/dtos/response-pagination.dto';

@ApiTags('Agent Standard Messages')
@ApiBearerAuth('bearer')
@Controller('standard-messages')
@Roles(Role.AGENT)
export class AgentStandardMessageController {
  constructor(private readonly service: AgentStandardMessageService) {}

  @Post()
  @ApiOperation({ summary: 'Criar mensagem padrao do atendente' })
  @ApiResponse({ status: 201, type: ResponseAgentStandardMessageDto })
  create(
    @Body() dto: CreateAgentStandardMessageDto,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseAgentStandardMessageDto> {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mensagens padrao do atendente' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @AuthUser() user: UserPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ResponsePaginationDto<ResponseAgentStandardMessageDto>> {
    return this.service.findAll(
      user,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar mensagem padrao por ID' })
  @ApiResponse({ status: 200, type: ResponseAgentStandardMessageDto })
  findById(
    @Param('id') id: string,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseAgentStandardMessageDto> {
    return this.service.findById(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar mensagem padrao do atendente' })
  @ApiResponse({ status: 200, type: ResponseAgentStandardMessageDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAgentStandardMessageDto,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseAgentStandardMessageDto> {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar mensagem padrao do atendente' })
  delete(@Param('id') id: string, @AuthUser() user: UserPayload): Promise<void> {
    return this.service.delete(id, user);
  }
}
