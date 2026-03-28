import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Ticket, TicketStatus, TicketPriority } from './ticket.entity';

@Injectable()
export class PrismaTicketRepository {
  constructor(private prisma: PrismaService) {}

  async save(ticket: Ticket): Promise<void> {
    await this.prisma.ticket.upsert({
      where: { tkt_id: ticket.getTicketId() },
      update: {
        tkt_agentId: ticket.getAgentId(),
        tkt_status: ticket.getStatus(),
        tkt_priority: ticket.getPriority(),
        tkt_ratingScore: ticket.getRatingScore(),
        tkt_ratingComment: ticket.getRatingComment(),
      },
      create: {
        tkt_id: ticket.getTicketId(),
        tkt_companyId: ticket.getCompanyId(),
        tkt_clientId: ticket.getClientId(),
        tkt_agentId: ticket.getAgentId(),
        tkt_supportGroupId: ticket.getSupportGroupId(),
        tkt_subjectId: ticket.getSubjectId(),
        tkt_status: ticket.getStatus(),
        tkt_priority: ticket.getPriority(),
        tkt_ratingScore: ticket.getRatingScore(),
        tkt_ratingComment: ticket.getRatingComment(),
      },
    });
  }

  async findById(ticket_id: string): Promise<Ticket | null> {
    const data = await this.prisma.ticket.findUnique({
      where: { tkt_id: ticket_id },
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
      where: { tkt_id: ticket_id },
    });
  }

  private mapToEntity(data: any): Ticket {
    return new Ticket(
      data.tkt_id,
      data.tkt_companyId,
      data.tkt_clientId,
      data.tkt_agentId,
      data.tkt_supportGroupId,
      data.tkt_subjectId,
      data.tkt_status as TicketStatus,
      data.tkt_priority as TicketPriority,
      data.tkt_ratingScore,
      data.tkt_ratingComment
    );
  }
}

