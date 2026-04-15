import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '@database/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import {
  TicketAction,
  TicketPriority,
  TicketStatus,
} from '../../../generated/prisma/enums';

type TicketCreatePayload = {
  companyId: string;
  clientId: string;
  supportGroupId: string;
  subjectId: string;
  priority?: TicketPriority;
};

type FindTicketOptions = {
  includeArchived?: boolean;
  includeDeleted?: boolean;
};

type FindManyTicketOptions = {
  skip?: number;
  take?: number;
};

const TICKET_PUBLIC_SELECT = {
  id: true,
  companyId: true,
  clientId: true,
  agentId: true,
  supportGroupId: true,
  subjectId: true,
  status: true,
  priority: true,
  ratingScore: true,
  ratingComment: true,
  createdAt: true,
  updatedAt: true,
  closedAt: true,
  isArchived: true,
  deletedAt: true,
  client: {
    select: {
      id: true,
      name: true,
    },
  },
  agent: {
    select: {
      id: true,
      supportLevel: true,
    },
  },
  company: {
    select: {
      id: true,
      name: true,
    },
  },
  supportGroup: {
    select: {
      id: true,
      name: true,
    },
  },
  subject: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.TicketSelect;

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: TicketCreatePayload) {
    return this.prisma.ticket.create({
      data: {
        id: randomUUID(),
        companyId: data.companyId,
        clientId: data.clientId,
        supportGroupId: data.supportGroupId,
        subjectId: data.subjectId,
        status: TicketStatus.TRIAGE,
        priority: data.priority ?? null,
      },
      select: TICKET_PUBLIC_SELECT,
    });
  }

  async update(ticketId: string, data: Prisma.TicketUpdateInput) {
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data,
      select: TICKET_PUBLIC_SELECT,
    });
  }

  async findById(ticketId: string, options: FindTicketOptions = {}) {
    const { includeArchived = false, includeDeleted = false } = options;

    return this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        ...(includeArchived ? {} : { isArchived: false }),
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      select: TICKET_PUBLIC_SELECT,
    });
  }

  async findMany(
    where: Prisma.TicketWhereInput = {},
    options: FindManyTicketOptions = {},
  ) {
    const { skip, take } = options;

    return this.prisma.ticket.findMany({
      where,
      select: TICKET_PUBLIC_SELECT,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async count(where: Prisma.TicketWhereInput = {}) {
    return this.prisma.ticket.count({ where });
  }

  async archive(ticketId: string) {
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { isArchived: true },
      select: TICKET_PUBLIC_SELECT,
    });
  }

  async unarchive(ticketId: string) {
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { isArchived: false },
      select: TICKET_PUBLIC_SELECT,
    });
  }

  async softDelete(ticketId: string) {
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        deletedAt: new Date(),
        isArchived: true,
      },
      select: TICKET_PUBLIC_SELECT,
    });
  }

  async createHistory(data: {
    ticketId: string;
    actionType: TicketAction;
    fromStatus?: TicketStatus | null;
    toStatus?: TicketStatus | null;
    fromGroupId?: string | null;
    toGroupId?: string | null;
    fromAgentId?: string | null;
    toAgentId?: string | null;
  }) {
    return this.prisma.ticketHistory.create({
      data: {
        id: randomUUID(),
        ticketId: data.ticketId,
        actionType: data.actionType,
        fromStatus: data.fromStatus ?? null,
        toStatus: data.toStatus ?? null,
        fromGroupId: data.fromGroupId ?? null,
        toGroupId: data.toGroupId ?? null,
        fromAgentId: data.fromAgentId ?? null,
        toAgentId: data.toAgentId ?? null,
      },
    });
  }
}
