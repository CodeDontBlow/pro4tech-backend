import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { TicketPriority } from '../../generated/prisma/enums';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  // Criar um ticket
  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.createTicket(dto);
  }

  // Atribuir um agente
  @Patch(':id/assign-agent')
  assignAgent(
    @Param('id') ticketId: string,
    @Body('agentId') agentId: string
  ) {
    return this.ticketService.assignAgent(ticketId, agentId);
  }

  // Escalar ticket
  @Patch(':id/escalate')
  escalate(@Param('id') ticketId: string) {
    return this.ticketService.escalateTicket(ticketId);
  }

  // Fechar ticket
  @Patch(':id/close')
  close(@Param('id') ticketId: string) {
    return this.ticketService.closeTicket(ticketId);
  }

  // Atualizar prioridade
  @Patch(':id/priority')
  updatePriority(
    @Param('id') ticketId: string,
    @Body('priority') priority: TicketPriority
  ) {
    return this.ticketService.updateTicket(ticketId, priority);
  }

  // Adicionar avaliação
  @Patch(':id/rating')
  addRating(
    @Param('id') ticketId: string,
    @Body('score') score: number,
    @Body('comment') comment?: string
  ) {
    return this.ticketService.addTicketRating(ticketId, score, comment);
  }

  // Listar todos tickets
  @Get()
  list() {
    return this.ticketService.listTickets();
  }

  // Obter ticket específico
  @Get(':id')
  get(@Param('id') ticketId: string) {
    return this.ticketService.getTicket(ticketId);
  }

  // Deletar ticket
  @Delete(':id')
  delete(@Param('id') ticketId: string) {
    return this.ticketService.deleteTicket(ticketId);
  }
}