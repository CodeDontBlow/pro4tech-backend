import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { TicketStatus } from '../../../generated/prisma/enums';

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.ticket.create({
      data: {
        id: this.generateId(),
        companyId: data.companyId,
        clientId: data.clientId,
        supportGroupId: data.supportGroupId,
        subjectId: data.subjectId,
        status: data.status ?? 'TRIAGE',
        priority: data.priority ?? null,
      },
      include: {
        client: true,
        agent: true,
        company: true,
        supportGroup: true,
        subject: true,
      },
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async update(ticketId: string, dto: UpdateTicketDto) {
    const data: any = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.ratingScore !== undefined) data.ratingScore = dto.ratingScore;
    if (dto.ratingComment !== undefined) data.ratingComment = dto.ratingComment;
    if (dto.status === 'CLOSED') data.closedAt = new Date();

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data,
    });
  }

  async findById(ticketId: string) {
    return this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        client: true,
        agent: true,
        company: true,
        supportGroup: true,
        subject: true,
      },
    });
  }

  async findMany(where?: any) {
    return this.prisma.ticket.findMany({
      where,
      include: {
        client: true,
        agent: true,
        company: true,
        supportGroup: true,
        subject: true,
      },
    });
  }

  async delete(ticketId: string) {
    return this.prisma.ticket.delete({
      where: { id: ticketId },
    });
  }
}