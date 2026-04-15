import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { Prisma, Role } from 'generated/prisma/client';
import { TicketRepository } from './ticket.repository';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { SupportGroupRepository } from '../support-group/support-group.repository';
import { TicketSubjectRepository } from '../ticket-subject/ticket-subject.repository';
import {
  TicketAction,
  TicketStatus,
} from '../../../generated/prisma/enums';
import { UserPayload } from 'src/common/decorators/auth-user.decorator';

type ListTicketsInput = {
  user: UserPayload;
  status?: TicketStatus;
  agentId?: string;
  clientId?: string;
  includeArchived?: boolean;
};

type TicketWithRelations = NonNullable<
  Awaited<ReturnType<TicketRepository['findById']>>
>;

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketRepository: TicketRepository,
    private readonly supportGroupRepository: SupportGroupRepository,
    private readonly ticketSubjectRepository: TicketSubjectRepository,
  ) {}

  async createTicket(dto: CreateTicketDto, user: UserPayload) {
    const role = this.getRole(user);
    if (role !== Role.CLIENT) {
      throw new ForbiddenException('Only clients can create tickets');
    }

    if (dto.clientId !== user.sub) {
      throw new ForbiddenException(
        'clientId must match the authenticated user',
      );
    }

    await this.validateSupportGroup(dto.supportGroupId);
    await this.validateSubject(dto.subjectId);

    const client = await this.prisma.user.findFirst({
      where: {
        id: dto.clientId,
        role: Role.CLIENT,
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found or inactive');
    }

    const ticket = await this.ticketRepository.create({
      companyId: client.companyId,
      clientId: client.id,
      supportGroupId: dto.supportGroupId,
      subjectId: dto.subjectId,
      priority: dto.priority,
    });

    this.logger.log(`Ticket created — id: ${ticket.id}, clientId: ${client.id}`);
    return ticket;
  }

  async updateTicket(
    ticketId: string,
    dto: UpdateTicketDto,
    user: UserPayload,
  ) {
    const role = this.getRole(user);
    const ticket = await this.ticketRepository.findById(ticketId, {
      includeArchived: true,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    if (ticket.isArchived) {
      throw new BadRequestException('Archived tickets cannot be updated');
    }

    await this.assertTicketVisibility(ticket, user);

    const hasStatusChange = dto.status !== undefined;
    const hasPriorityChange = dto.priority !== undefined;
    const hasRatingChange =
      dto.ratingScore !== undefined || dto.ratingComment !== undefined;

    if (!hasStatusChange && !hasPriorityChange && !hasRatingChange) {
      return ticket;
    }

    if (hasStatusChange || hasPriorityChange) {
      if (role === Role.CLIENT) {
        throw new ForbiddenException('Clients can only submit ticket rating');
      }

      if (role === Role.AGENT && ticket.agentId !== user.sub) {
        throw new ForbiddenException(
          'Only the assigned agent can update status or priority',
        );
      }
    }

    if (hasRatingChange) {
      if (role !== Role.CLIENT || ticket.clientId !== user.sub) {
        throw new ForbiddenException(
          'Only the ticket owner can submit a rating',
        );
      }

      if (
        ticket.status !== TicketStatus.CLOSED
        && ticket.status !== TicketStatus.RESOLVED
      ) {
        throw new BadRequestException(
          'Rating is allowed only when ticket is CLOSED or RESOLVED',
        );
      }
    }

    if (hasStatusChange && dto.status) {
      this.validateStatusTransition(ticket.status, dto.status);

      if (dto.status === TicketStatus.CLOSED) {
        if (!ticket.agentId || ticket.agentId !== user.sub) {
          throw new ForbiddenException(
            'Only the assigned agent can close this ticket',
          );
        }
      }
    }

    const updateData: Prisma.TicketUpdateInput = {};
    if (hasStatusChange && dto.status) {
      updateData.status = dto.status;
      if (dto.status === TicketStatus.CLOSED) {
        updateData.closedAt = new Date();
      }
    }
    if (hasPriorityChange) updateData.priority = dto.priority;
    if (dto.ratingScore !== undefined) updateData.ratingScore = dto.ratingScore;
    if (dto.ratingComment !== undefined)
      updateData.ratingComment = dto.ratingComment;

    const updatedTicket = await this.ticketRepository.update(ticketId, updateData);

    if (hasStatusChange && dto.status && dto.status !== ticket.status) {
      await this.ticketRepository.createHistory({
        ticketId,
        actionType: TicketAction.STATUS_CHANGE,
        fromStatus: ticket.status,
        toStatus: dto.status,
        fromGroupId: ticket.supportGroupId,
        toGroupId: ticket.supportGroupId,
        fromAgentId: ticket.agentId,
        toAgentId: ticket.agentId,
      });
    }

    return updatedTicket;
  }

  async getTicket(
    ticketId: string,
    user: UserPayload,
    includeArchived: boolean = false,
  ) {
    const ticket = await this.ticketRepository.findById(ticketId, {
      includeArchived,
    });
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    await this.assertTicketVisibility(ticket, user);
    return ticket;
  }

  async listTickets({
    user,
    status,
    agentId,
    clientId,
    includeArchived = false,
  }: ListTicketsInput) {
    const where = await this.buildVisibilityWhere({
      user,
      status,
      agentId,
      clientId,
      includeArchived,
    });

    return this.ticketRepository.findMany(where);
  }

  async archiveTicket(ticketId: string, user: UserPayload) {
    const role = this.getRole(user);
    const ticket = await this.ticketRepository.findById(ticketId, {
      includeArchived: true,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    if (role === Role.CLIENT) {
      throw new ForbiddenException('Clients cannot archive tickets');
    }

    if (role === Role.AGENT && ticket.agentId !== user.sub) {
      throw new ForbiddenException(
        'Only the assigned agent can archive this ticket',
      );
    }

    if (ticket.isArchived) {
      return ticket;
    }

    const archivedTicket = await this.ticketRepository.archive(ticketId);
    await this.ticketRepository.createHistory({
      ticketId,
      actionType: TicketAction.ARCHIVE,
      fromStatus: ticket.status,
      toStatus: ticket.status,
      fromGroupId: ticket.supportGroupId,
      toGroupId: ticket.supportGroupId,
      fromAgentId: ticket.agentId,
      toAgentId: ticket.agentId,
    });

    return archivedTicket;
  }

  async unarchiveTicket(ticketId: string, user: UserPayload) {
    const role = this.getRole(user);
    const ticket = await this.ticketRepository.findById(ticketId, {
      includeArchived: true,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    if (role === Role.CLIENT) {
      throw new ForbiddenException('Clients cannot unarchive tickets');
    }

    if (role === Role.AGENT && ticket.agentId !== user.sub) {
      throw new ForbiddenException(
        'Only the assigned agent can unarchive this ticket',
      );
    }

    if (!ticket.isArchived) {
      return ticket;
    }

    const unarchivedTicket = await this.ticketRepository.unarchive(ticketId);
    await this.ticketRepository.createHistory({
      ticketId,
      actionType: TicketAction.UNARCHIVE,
      fromStatus: ticket.status,
      toStatus: ticket.status,
      fromGroupId: ticket.supportGroupId,
      toGroupId: ticket.supportGroupId,
      fromAgentId: ticket.agentId,
      toAgentId: ticket.agentId,
    });

    return unarchivedTicket;
  }

  async deleteTicket(ticketId: string, user: UserPayload): Promise<void> {
    const role = this.getRole(user);
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete tickets');
    }

    const ticket = await this.ticketRepository.findById(ticketId, {
      includeArchived: true,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    await this.ticketRepository.softDelete(ticketId);
    await this.ticketRepository.createHistory({
      ticketId,
      actionType: TicketAction.SOFT_DELETE,
      fromStatus: ticket.status,
      toStatus: ticket.status,
      fromGroupId: ticket.supportGroupId,
      toGroupId: ticket.supportGroupId,
      fromAgentId: ticket.agentId,
      toAgentId: ticket.agentId,
    });

    this.logger.log(`Ticket soft deleted — id: ${ticketId}`);
  }

  private async buildVisibilityWhere({
    user,
    status,
    agentId,
    clientId,
    includeArchived,
  }: ListTicketsInput): Promise<Prisma.TicketWhereInput> {
    const role = this.getRole(user);

    const baseWhere: Prisma.TicketWhereInput = {
      deletedAt: null,
      ...(includeArchived ? {} : { isArchived: false }),
      ...(status ? { status } : {}),
    };

    if (role === Role.CLIENT) {
      if (clientId && clientId !== user.sub) {
        throw new ForbiddenException('Clients can only query their own tickets');
      }

      return {
        ...baseWhere,
        clientId: user.sub,
        ...(agentId ? { agentId } : {}),
      };
    }

    if (role === Role.ADMIN) {
      return {
        ...baseWhere,
        companyId: user.companyId,
        ...(agentId ? { agentId } : {}),
        ...(clientId ? { clientId } : {}),
      };
    }

    if (role === Role.AGENT) {
      const groupIds = await this.getAgentGroupIds(user.sub);
      const visibilityScopes: Prisma.TicketWhereInput[] = [{
        agentId: user.sub,
      }];

      if (groupIds.length > 0) {
        visibilityScopes.push({
          supportGroupId: {
            in: groupIds,
          },
        });
      }

      return {
        ...baseWhere,
        OR: visibilityScopes,
        ...(agentId ? { agentId } : {}),
        ...(clientId ? { clientId } : {}),
      };
    }

    throw new ForbiddenException('Invalid user role');
  }

  private async assertTicketVisibility(
    ticket: TicketWithRelations,
    user: UserPayload,
  ) {
    const role = this.getRole(user);

    if (role === Role.CLIENT && ticket.clientId !== user.sub) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    if (role === Role.ADMIN && ticket.companyId !== user.companyId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    if (role === Role.AGENT) {
      if (ticket.agentId === user.sub) {
        return;
      }

      const supportGroupId = ticket.supportGroupId;
      if (!supportGroupId) {
        throw new ForbiddenException('You do not have access to this ticket');
      }

      const groupIds = await this.getAgentGroupIds(user.sub);
      if (!groupIds.includes(supportGroupId)) {
        throw new ForbiddenException('You do not have access to this ticket');
      }
    }
  }

  private async getAgentGroupIds(agentId: string): Promise<string[]> {
    const groups = await this.prisma.agentGroup.findMany({
      where: { agentId },
      select: { supportGroupId: true },
    });

    return groups.map((group) => group.supportGroupId);
  }

  private getRole(user: UserPayload): Role {
    if (user.role === Role.CLIENT) return Role.CLIENT;
    if (user.role === Role.AGENT) return Role.AGENT;
    if (user.role === Role.ADMIN) return Role.ADMIN;

    throw new ForbiddenException('Invalid user role');
  }

  private async validateSupportGroup(supportGroupId: string): Promise<void> {
    const supportGroup = await this.supportGroupRepository.findById(supportGroupId);
    if (!supportGroup) {
      throw new NotFoundException(`Support Group ${supportGroupId} not found`);
    }
    if (!supportGroup.isActive) {
      throw new BadRequestException('Support Group is not active');
    }
  }

  private async validateSubject(subjectId: string): Promise<void> {
    const subject = await this.ticketSubjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Ticket Subject ${subjectId} not found`);
    }
    if (!subject.isActive) {
      throw new BadRequestException('Ticket Subject is not active');
    }
  }

  private validateStatusTransition(
    currentStatus: TicketStatus,
    newStatus: TicketStatus,
  ): void {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      TRIAGE: [TicketStatus.OPENED],
      OPENED: [
        TicketStatus.ESCALATED,
        TicketStatus.RESOLVED,
        TicketStatus.CLOSED,
      ],
      ESCALATED: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      RESOLVED: [TicketStatus.CLOSED],
      CLOSED: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
