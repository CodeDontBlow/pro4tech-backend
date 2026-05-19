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
  triageLeafId: string;
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
  ticketNumber: true,
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
  triageLeafId: true,
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
      user: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
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
        triageLeafId: data.triageLeafId,
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

  async getAverageResolutionTimeMs(): Promise<number> {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        closedAt: { not: null },
        deletedAt: null,
        isArchived: false,
      },
      select: {
        createdAt: true,
        closedAt: true,
      },
    });

    if (tickets.length === 0) {
      return 0;
    }

    const totalMs = tickets.reduce((sum, ticket) => {
      return sum + (ticket.closedAt!.getTime() - ticket.createdAt.getTime());
    }, 0);

    return Math.round(totalMs / tickets.length);
  }

  async getCustomerSatisfactionDistribution(): Promise<
    Array<{ score: number; count: number }>
  > {
    const grouped = await this.prisma.ticket.groupBy({
      by: ['ratingScore'],
      where: {
        ratingScore: { not: null },
        deletedAt: null,
        isArchived: false,
      },
      _count: {
        ratingScore: true,
      },
    });

    return grouped
      .map((item) => ({
        score: item.ratingScore ?? 0,
        count: item._count.ratingScore,
      }))
      .sort((a, b) => a.score - b.score);
  }

  async getTicketVolumeByHour(): Promise<Array<{ hour: number; count: number }>> {
    const conditions = [
      Prisma.sql`"deletedAt" IS NULL`,
      Prisma.sql`"isArchived" = false`,
    ];

    const whereSql = Prisma.join(conditions, ' AND ');
    const rows = await this.prisma.$queryRaw<
      Array<{ hour: number; count: number }>
    >(
      Prisma.sql`
        SELECT
          EXTRACT(HOUR FROM "createdAt")::int AS hour,
          COUNT(*)::int AS count
        FROM "Ticket"
        WHERE ${whereSql}
        GROUP BY 1
        ORDER BY 1
      `,
    );

    const bucket = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
    }));

    for (const row of rows) {
      const hour = Number(row.hour);
      const count = Number(row.count);
      if (!Number.isNaN(hour) && hour >= 0 && hour < 24) {
        bucket[hour].count = count;
      }
    }

    return bucket;
  }

  async getTicketsPerSubject(
    since: Date
    ): Promise<Array<{ subjectId: string; subjectName: string; count: number }>> {
    const conditions = [
      Prisma.sql`"t"."deletedAt" IS NULL`,
      Prisma.sql`"t"."isArchived" = false`,
      Prisma.sql`"t"."subjectId" IS NOT NULL`,
    ];

    if (since) {
      conditions.push(Prisma.sql`"t"."createdAt" >= ${since}`);
    }

    const whereSql = Prisma.join(conditions, ' AND ');

    const rows = await this.prisma.$queryRaw<
      Array<{ subjectId: string; subjectName: string; count: number }>
    >(
      Prisma.sql`
        SELECT
          "s"."id" AS "subjectId",
          "s"."name" AS "subjectName",
          COUNT(*)::int AS count
        FROM "Ticket" "t"
        JOIN "TicketSubject" "s" ON "s"."id" = "t"."subjectId"
        WHERE ${whereSql}
        GROUP BY "s"."id", "s"."name"
        ORDER BY count DESC
      `,
    );

    return rows;
  }

  async getReopenRatePercent(
    since: Date
  ): Promise<number> {    
    const reopenedTickets = await this.prisma.ticketHistory.findMany({
      where: {
        actionType: TicketAction.REOPEN,
        ...(since ? { createdAt: { gte: since } } : {}),
        ticketHistory: {
          deletedAt: null,
          isArchived: false,
        },
      },
      distinct: ['ticketId'],
      select: {
        ticketId: true,
      },
    });

    const closedCount = await this.prisma.ticket.count({
      where: {
        status: { in: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
        closedAt: { not: null, ...(since ? { gte: since } : {}) },
        deletedAt: null,
        isArchived: false,
      },
    });

    if (closedCount === 0) {
      return 0;
    }

    const reopenedCount = reopenedTickets.length;
    return Math.round((reopenedCount / closedCount) * 10000) / 100;
  }

  async getCompanyTicketStats(
    options: { since?: Date; companyName?: string },
    pagination: { page: number; limit: number },
  ): Promise<
    Array<{
      companyId: string;
      companyName: string;
      ticketCount: number;
      ratingCount: number;
      ratingAverage: number | null;
    }>
  > {
    const { since, companyName } = options;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const conditions = [
      Prisma.sql`"t"."deletedAt" IS NULL`,
      Prisma.sql`"t"."isArchived" = false`,
    ];

    if (since) {
      conditions.push(Prisma.sql`"t"."createdAt" >= ${since}`);
    }

    if (companyName) {
      conditions.push(Prisma.sql`"c"."name" ILIKE ${companyName + '%'}`);
    }

    const whereSql = Prisma.join(conditions, ' AND ');

    const rows = await this.prisma.$queryRaw<
      Array<{
        companyId: string;
        companyName: string;
        ticketCount: number;
        ratingCount: number;
        ratingAverage: number | null;
      }>
    >(
      Prisma.sql`
        SELECT
          "t"."companyId" AS "companyId",
          "c"."name" AS "companyName",
          COUNT(*)::int AS "ticketCount",
          COUNT("t"."ratingScore")::int AS "ratingCount",
          AVG("t"."ratingScore")::float AS "ratingAverage"
        FROM "Ticket" "t"
        JOIN "Company" "c" ON "c"."id" = "t"."companyId"
        WHERE ${whereSql}
        GROUP BY "t"."companyId", "c"."name"
        ORDER BY "ticketCount" DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
    );

    return rows;
  }

  async getCompanyTicketStatsTotal(
    options: { since?: Date; companyName?: string },
  ): Promise<number> {
    const { since, companyName } = options;
    const conditions = [
      Prisma.sql`"t"."deletedAt" IS NULL`,
      Prisma.sql`"t"."isArchived" = false`,
    ];

    if (since) {
      conditions.push(Prisma.sql`"t"."createdAt" >= ${since}`);
    }

    if (companyName) {
      conditions.push(Prisma.sql`"c"."name" ILIKE ${companyName + '%'}`);
    }

    const whereSql = Prisma.join(conditions, ' AND ');
    const rows = await this.prisma.$queryRaw<Array<{ total: number }>>(
      Prisma.sql`
        SELECT COUNT(*)::int AS total FROM (
          SELECT "t"."companyId"
          FROM "Ticket" "t"
          JOIN "Company" "c" ON "c"."id" = "t"."companyId"
          WHERE ${whereSql}
          GROUP BY "t"."companyId"
        ) "s"
      `,
    );

    return rows[0]?.total ?? 0;
  }

  async getAgentTicketStats(
    options: { since?: Date; agentName?: string },
    pagination: { page: number; limit: number },
  ): Promise<
    Array<{
      agentId: string;
      agentName: string;
      closedCount: number;
      avgResolutionMs: number;
      ratingAverage: number | null;
      ratingCount: number;
    }>
  > {
    const { since, agentName } = options;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const conditions = [
      Prisma.sql`"t"."deletedAt" IS NULL`,
      Prisma.sql`"t"."isArchived" = false`,
      Prisma.sql`"t"."agentId" IS NOT NULL`,
      Prisma.sql`"u"."deletedAt" IS NULL`,
      Prisma.sql`"u"."role" = 'AGENT'`,
    ];

    if (since) {
      conditions.push(Prisma.sql`"t"."createdAt" >= ${since}`);
    }

    if (agentName) {
      conditions.push(Prisma.sql`"u"."name" ILIKE ${agentName + '%'}`);
    }

    const whereSql = Prisma.join(conditions, ' AND ');

    const rows = await this.prisma.$queryRaw<
      Array<{
        agentId: string;
        agentName: string;
        closedCount: number;
        avgResolutionMs: number;
        ratingAverage: number | null;
        ratingCount: number;
      }>
    >(
      Prisma.sql`
        SELECT
          "t"."agentId" AS "agentId",
          "u"."name" AS "agentName",
          COUNT(*) FILTER (
            WHERE "t"."status" IN ('CLOSED', 'RESOLVED')
          )::int AS "closedCount",
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM ("t"."closedAt" - "t"."createdAt")) * 1000
            ) FILTER (WHERE "t"."closedAt" IS NOT NULL),
            0
          )::float AS "avgResolutionMs",
          AVG("t"."ratingScore")::float AS "ratingAverage",
          COUNT("t"."ratingScore")::int AS "ratingCount"
        FROM "Ticket" "t"
        JOIN "User" "u" ON "u"."id" = "t"."agentId"
        WHERE ${whereSql}
        GROUP BY "t"."agentId", "u"."name"
        ORDER BY "closedCount" DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
    );

    return rows;
  }

  async getAgentTicketStatsTotal(
    options: { since?: Date; agentName?: string },
  ): Promise<number> {
    const { since, agentName } = options;
    const conditions = [
      Prisma.sql`"t"."deletedAt" IS NULL`,
      Prisma.sql`"t"."isArchived" = false`,
      Prisma.sql`"t"."agentId" IS NOT NULL`,
      Prisma.sql`"u"."deletedAt" IS NULL`,
      Prisma.sql`"u"."role" = 'AGENT'`,
    ];

    if (since) {
      conditions.push(Prisma.sql`"t"."createdAt" >= ${since}`);
    }

    if (agentName) {
      conditions.push(Prisma.sql`"u"."name" ILIKE ${agentName + '%'}`);
    }

    const whereSql = Prisma.join(conditions, ' AND ');
    const rows = await this.prisma.$queryRaw<Array<{ total: number }>>(
      Prisma.sql`
        SELECT COUNT(*)::int AS total FROM (
          SELECT "t"."agentId"
          FROM "Ticket" "t"
          JOIN "User" "u" ON "u"."id" = "t"."agentId"
          WHERE ${whereSql}
          GROUP BY "t"."agentId"
        ) "s"
      `,
    );

    return rows[0]?.total ?? 0;
  }
 
}
