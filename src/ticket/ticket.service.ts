import { Ticket, TicketPriority } from './ticket.entity';
import { PrismaTicketRepository } from './ticket.repository';

export class TicketService {
  constructor(private ticketRepository: PrismaTicketRepository) {}

  async assignAgent(ticket_id: string, agent_id: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(ticket_id);
    if (!ticket) throw new Error('Ticket não encontrado');

    ticket.assignAgent(agent_id);
    await this.ticketRepository.save(ticket);
  }

  async escalateTicket(ticket_id: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(ticket_id);
    if (!ticket) throw new Error('Ticket não encontrado');

    ticket.escalate();
    await this.ticketRepository.save(ticket);
  }

  async closeTicket(ticket_id: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(ticket_id);
    if (!ticket) throw new Error('Ticket não encontrado');

    ticket.closeTicket();
    await this.ticketRepository.save(ticket);
  }

  async updateTicketPriority(ticket_id: string, priority: TicketPriority): Promise<void> {
    const ticket = await this.ticketRepository.findById(ticket_id);
    if (!ticket) throw new Error('Ticket não encontrado');

    ticket.updatePriority(priority);
    await this.ticketRepository.save(ticket);
  }

  async addTicketRating(ticket_id: string, score: number, comment?: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(ticket_id);
    if (!ticket) throw new Error('Ticket não encontrado');

    ticket.addRating(score, comment);
    await this.ticketRepository.save(ticket);
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

