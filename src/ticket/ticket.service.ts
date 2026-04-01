import { Injectable } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { TicketPriority, TicketStatus } from '../../generated/prisma/enums';
import { UpdateTicketDto } from './dtos/update-ticket.dto';

export class TicketService {
  constructor(private ticketRepository: TicketRepository) {}

  async createTicket(dto: any) {
    return this.ticketRepository.create(dto);
  }

  async assignAgent(ticketId: string, agentId: string) {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) throw new Error('Ticket não encontrado');

    const status = ticket.tkt_status === 'TRIAGE' ? 'OPENED' : ticket.tkt_status;

    return this.ticketRepository.update(ticketId, {
      agentId,
      status,
    });
  }

  async escalateTicket(ticketId: string) {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) throw new Error('Ticket não encontrado');
    if (ticket.tkt_status !== 'OPENED') throw new Error('Só é possível escalar tickets abertos');

    return this.ticketRepository.update(ticketId, { status: 'ESCALATED' });
  }

  async closeTicket(ticketId: string) {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) throw new Error('Ticket não encontrado');
    if (ticket.tkt_status === 'CLOSED') throw new Error('Ticket já está fechado');

    return this.ticketRepository.update(ticketId, { status: 'CLOSED' });
  }

  async updateTicket(ticketId: string, priority: TicketPriority) {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) throw new Error('Ticket não encontrado');

    return this.ticketRepository.update(ticketId, { priority });
  }

  async addTicketRating(ticketId: string, ratingScore: number, ratingComment?: string) {
    if (ratingScore < 0 || ratingScore > 5) throw new Error('Score deve ser entre 0 e 5');

    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) throw new Error('Ticket não encontrado');

    return this.ticketRepository.update(ticketId, { ratingScore, ratingComment });
  }

  async getTicket(ticket_id: string) {
    return await this.ticketRepository.findById(ticket_id);
  }

  async listTickets() {
    return await this.ticketRepository.findAll();
  }

  async deleteTicket(ticket_id: string): Promise<void> {
    await this.ticketRepository.delete(ticket_id);
  }
}

