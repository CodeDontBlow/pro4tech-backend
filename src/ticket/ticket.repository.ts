import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { TicketStatus } from '../../generated/prisma/enums';

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        tkt_companyId: dto.companyId,
        tkt_clientId: dto.clientId,
        tkt_agentId: dto.agentId,
        tkt_supportGroupId: dto.supportGroupId,
        tkt_subjectId: dto.subjectId,
        tkt_status: dto.status ?? 'TRIAGE',
        tkt_priority: dto.priority ?? null,
      },
    });
  }

  async update(ticketId: string, dto: UpdateTicketDto) {
    return this.prisma.ticket.update({
      where: { tkt_id: ticketId , tkt_closedAt: null},
      data: {
        tkt_status: dto.status,
        tkt_priority: dto.priority,
        tkt_ratingScore: dto.ratingScore,
        tkt_ratingComment: dto.ratingComment,
        tkt_agentId: dto.agentId,
        tkt_closedAt: dto.closedAt === TicketStatus.OPENED ? new Date() : undefined,
      }
    });
  }

  async findById(ticketId: string) {
    return this.prisma.ticket.findUnique({
      where: { tkt_id: ticketId }
    });
  }

  async findAll() {
    return this.prisma.ticket.findMany({
    });
  }

  async delete(ticketId: string) {
    return this.prisma.ticket.delete({
      where: { tkt_id: ticketId }
    });
  }
}