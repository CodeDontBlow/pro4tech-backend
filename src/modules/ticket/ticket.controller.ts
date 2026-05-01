import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import {
  ResponseTicketDto,
  ResponseTicketPaginationDto,
} from './dtos/response-ticket.dto';
import {
  AuthUser,
  UserPayload,
} from 'src/common/decorators/auth-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/client';
import { TicketStatus } from '../../../generated/prisma/enums';
import { ResponsePaginationDto } from '@common/dtos/response-pagination.dto';
import { TicketCreateRateLimitGuard } from './guards/ticket-create-rate-limit.guard';

@ApiBearerAuth()
@ApiTags('Ticket')
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get(':id/triage-history')
    async getTriageHistory(@Param('id') id: string) {
      return this.ticketService.getTicketTriageHistory(id);
  }

  /**
   * POST /tickets
   * Criar um novo ticket
   * - O frontend envia apenas triageLeafId; backend resolve assunto e grupo pela folha
   * - clientId é sempre obtido do token JWT do usuário autenticado
   */
  @Post()
  @Roles(Role.CLIENT)
  @UseGuards(TicketCreateRateLimitGuard)
  @ApiOperation({ summary: 'Criar um novo ticket' })
  @ApiResponse({
    status: 201,
    description: 'Ticket criado com sucesso',
    type: ResponseTicketDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas de criação de ticket em curto período',
  })
  async create(
    @Body() dto: CreateTicketDto,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.createTicket(dto, user);
  }

  /**
   * GET /tickets/:id
   * Buscar ticket por ID com relacionamentos
   */
  @Get(':id')
  @Roles(Role.CLIENT, Role.AGENT, Role.ADMIN)
  @ApiQuery({
    name: 'includeArchived',
    required: false,
    type: Boolean,
    description: 'Defina como true para incluir tickets arquivados na consulta',
  })
  @ApiOperation({ summary: 'Buscar ticket por ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket encontrado',
    type: ResponseTicketDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  async getById(
    @Param('id') ticketId: string,
    @AuthUser() user: UserPayload,
    @Query('includeArchived') includeArchived?: string,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.getTicket(
      ticketId,
      user,
      includeArchived === 'true',
    );
  }

  /**
   * GET /tickets
   * Listar tickets com filtros opcionais
   */
  @Get()
  @Roles(Role.CLIENT, Role.AGENT, Role.ADMIN)
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TicketStatus,
    description: 'Filtrar por status do ticket',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: String,
    description: 'Filtrar por ID da empresa',
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    type: String,
    description: 'Filtrar por ID do agente atribuído',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    type: String,
    description: 'Filtrar por ID do cliente',
  })
  @ApiQuery({
    name: 'includeArchived',
    required: false,
    type: Boolean,
    description: 'Defina como true para incluir tickets arquivados',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Quantidade por página (padrão: 10, máximo: 100)',
  })
  @ApiOperation({ summary: 'Listar tickets com filtros opcionais (paginado)' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de tickets',
    type: ResponseTicketPaginationDto,
  })
  async list(
    @AuthUser() user: UserPayload,
    @Query('status') status?: TicketStatus,
    @Query('companyId') companyId?: string,
    @Query('agentId') agentId?: string,
    @Query('clientId') clientId?: string,
    @Query('includeArchived') includeArchived?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponsePaginationDto<ResponseTicketDto>> {
    return this.ticketService.listTickets({
      user,
      status,
      companyId,
      agentId,
      clientId,
      includeArchived: includeArchived === 'true',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  /**
   * PATCH /tickets/:id
   * Atualizar ticket (status, prioridade, avaliação, etc.)
   */
  @Patch(':id/assign-self')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Agente assume o ticket para si' })
  @ApiResponse({
    status: 200,
    description: 'Ticket atribuído ao agente com sucesso',
    type: ResponseTicketDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas agentes podem assumir tickets',
  })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  async assignToMe(
    @Param('id') ticketId: string,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.assignTicketToMe(ticketId, user);
  }

  @Patch(':id')
  @Roles(Role.CLIENT, Role.AGENT, Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket atualizado com sucesso',
    type: ResponseTicketDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Transição de status inválida ou alteração de campo imutável',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas o agente atribuído pode fechar o ticket',
  })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  async update(
    @Param('id') ticketId: string,
    @Body() dto: UpdateTicketDto,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.updateTicket(ticketId, dto, user);
  }

  @Patch(':id/archive')
  @Roles(Role.AGENT, Role.ADMIN)
  @ApiOperation({ summary: 'Arquivar ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket arquivado com sucesso',
    type: ResponseTicketDto,
  })
  async archive(
    @Param('id') ticketId: string,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.archiveTicket(ticketId, user);
  }

  @Patch(':id/unarchive')
  @Roles(Role.AGENT, Role.ADMIN)
  @ApiOperation({ summary: 'Desarquivar ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket desarquivado com sucesso',
    type: ResponseTicketDto,
  })
  async unarchive(
    @Param('id') ticketId: string,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.unarchiveTicket(ticketId, user);
  }

  /**
   * DELETE /tickets/:id
   * Exclusão lógica de ticket
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Excluir ticket' })
  @ApiResponse({ status: 204, description: 'Ticket excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  async delete(
    @Param('id') ticketId: string,
    @AuthUser() user: UserPayload,
  ): Promise<void> {
    return this.ticketService.deleteTicket(ticketId, user);
  }
}
