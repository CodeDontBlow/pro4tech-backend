import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Ticket, TicketStatus, TicketPriority } from './ticket.entity';

@Injectable()
export class PrismaTicketRepository {
  constructor(private prisma: PrismaService) {}

  async save(ticket: Ticket): Promise<void> {
    await this.prisma.ticket.upsert({
      where: { id: ticket.getTicketId() },
      update: {
        agentId: ticket.getAgentId(),
        status: ticket.getStatus(),
        priority: ticket.getPriority(),
        ratingScore: ticket.getRatingScore(),
        ratingComment: ticket.getRatingComment(),
      },
      create: {
        id: ticket.getTicketId(),
        companyId: ticket.getCompanyId(),
        clientId: ticket.getClientId(),
        agentId: ticket.getAgentId(),
        supportGroupId: ticket.getSupportGroupId(),
        subjectId: ticket.getSubjectId(),
        status: ticket.getStatus(),
        priority: ticket.getPriority(),
        ratingScore: ticket.getRatingScore(),
        ratingComment: ticket.getRatingComment(),
      },
    });
  }

  async findById(ticket_id: string): Promise<Ticket | null> {
    const data = await this.prisma.ticket.findUnique({
      where: { id: ticket_id },
    });

    if (!data) return null;

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany();
    return tickets.map((data) => this.mapToEntity(data));
  }

  async delete(ticket_id: string): Promise<void> {
    await this.prisma.ticket.delete({
      where: { id: ticket_id },
    });
  }

  private mapToEntity(data: any): Ticket {
    return new Ticket(
      data.id,
      data.companyId,
      data.clientId,
      data.agentId,
      data.supportGroupId,
      data.subjectId,
      data.status as TicketStatus,
      data.priority as TicketPriority,
      data.ratingScore,
      data.ratingComment,
    );
  }
}
