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
import { ResponsePaginationDto } from '@common/dtos/response-pagination.dto';
import {
  TicketAction,
  TicketStatus,
} from '../../../generated/prisma/enums';
import { UserPayload } from 'src/common/decorators/auth-user.decorator';
import { TriageRuleService } from '../triage-rule/triage-rule.service';

type ListTicketsInput = {
  user: UserPayload;
  status?: TicketStatus;
  companyId?: string;
  agentId?: string;
  clientId?: string;
  includeArchived?: boolean;
  page?: number;
  limit?: number;
};

type BuildVisibilityWhereInput = Omit<ListTicketsInput, 'page' | 'limit'> & {
  agentSupportGroupIds?: string[];
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
    private readonly triageRuleService: TriageRuleService,
  ) {}

  async createTicket(dto: CreateTicketDto, user: UserPayload) {
    const role = this.getRole(user);
    if (role !== Role.CLIENT) {
      this.logger.warn(
        `Tentativa de criação de ticket por perfil inválido — role: ${role}`,
      );
      throw new ForbiddenException('Apenas clientes podem criar tickets');
    }

    const resolvedLeaf = await this.triageRuleService.resolveLeafForTicketCreation(
      dto.triageLeafId,
    );

    const client = await this.prisma.user.findFirst({
      where: {
        id: user.sub,
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
      this.logger.warn(
        `Cliente não encontrado ou inativo na criação de ticket — clientId: ${user.sub}`,
      );
      throw new NotFoundException('Cliente não encontrado ou inativo');
    }

    const ticket = await this.ticketRepository.create({
      companyId: client.companyId,
      clientId: client.id,
      supportGroupId: resolvedLeaf.supportGroupId,
      subjectId: resolvedLeaf.subjectId,
      priority: dto.priority,
    });

    this.logger.log(
      `Ticket criado — id: ${ticket.id}, clientId: ${client.id}, triageLeafId: ${dto.triageLeafId}`,
    );
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
      this.logger.warn(`Ticket não encontrado para atualização — id: ${ticketId}`);
      throw new NotFoundException('Ticket não encontrado');
    }

    if (ticket.isArchived) {
      this.logger.warn(`Tentativa de atualizar ticket arquivado — id: ${ticketId}`);
      throw new BadRequestException('Tickets arquivados não podem ser atualizados');
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
        this.logger.warn(
          `Cliente tentou atualizar status/prioridade — ticketId: ${ticketId}, userId: ${user.sub}`,
        );
        throw new ForbiddenException(
          'Clientes podem apenas enviar avaliação de ticket',
        );
      }

      if (role === Role.AGENT && ticket.agentId !== user.sub) {
        this.logger.warn(
          `Agente não atribuído tentou atualizar status/prioridade — ticketId: ${ticketId}, userId: ${user.sub}, assignedAgentId: ${ticket.agentId ?? 'nenhum'}`,
        );
        throw new ForbiddenException(
          'Apenas o agente atribuído pode atualizar status ou prioridade',
        );
      }
    }

    if (hasRatingChange) {
      if (role !== Role.CLIENT || ticket.clientId !== user.sub) {
        this.logger.warn(
          `Usuário sem permissão tentou avaliar ticket — ticketId: ${ticketId}, userId: ${user.sub}`,
        );
        throw new ForbiddenException(
          'Apenas o proprietário do ticket pode enviar uma avaliação',
        );
      }

      if (
        ticket.status !== TicketStatus.CLOSED
        && ticket.status !== TicketStatus.RESOLVED
      ) {
        this.logger.warn(
          `Tentativa de avaliar ticket fora de status permitido — ticketId: ${ticketId}, status: ${ticket.status}`,
        );
        throw new BadRequestException(
          'A avaliação é permitida apenas quando o ticket está FECHADO ou RESOLVIDO',
        );
      }
    }

    if (hasStatusChange && dto.status) {
      this.validateStatusTransition(ticket.status, dto.status);

      if (dto.status === TicketStatus.CLOSED) {
        if (!ticket.agentId || ticket.agentId !== user.sub) {
          this.logger.warn(
            `Tentativa de fechar ticket por agente não atribuído — ticketId: ${ticketId}, userId: ${user.sub}, assignedAgentId: ${ticket.agentId ?? 'nenhum'}`,
          );
          throw new ForbiddenException(
            'Apenas o agente atribuído pode fechar este ticket',
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

      this.logger.log(
        `Status do ticket atualizado — id: ${ticketId}, de: ${ticket.status}, para: ${dto.status}`,
      );
    }

    this.logger.log(`Ticket atualizado — id: ${ticketId}`);

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
      this.logger.warn(`Ticket não encontrado para consulta — id: ${ticketId}`);
      throw new NotFoundException('Ticket não encontrado');
    }

    await this.assertTicketVisibility(ticket, user);
    return ticket;
  }

  async listTickets({
    user,
    status,
    companyId,
    agentId,
    clientId,
    includeArchived = false,
    page = 1,
    limit = 10,
  }: ListTicketsInput) {
    const normalizedPage = this.normalizePage(page);
    const normalizedLimit = this.normalizeLimit(limit);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const role = this.getRole(user);
    const agentSupportGroupIds =
      role === Role.AGENT ? await this.getAgentSupportGroupIds(user.sub) : [];

    const where = this.buildVisibilityWhere({
      user,
      status,
      companyId,
      agentId,
      clientId,
      includeArchived,
      agentSupportGroupIds,
    });

    const [tickets, total] = await Promise.all([
      this.ticketRepository.findMany(where, {
        skip,
        take: normalizedLimit,
      }),
      this.ticketRepository.count(where),
    ]);

    this.logger.log(
      `Listagem de tickets concluída — role: ${user.role}, userId: ${user.sub}, total: ${tickets.length}, page: ${normalizedPage}, limit: ${normalizedLimit}`,
    );

    return new ResponsePaginationDto(tickets, total, normalizedPage, normalizedLimit);
  }

  async archiveTicket(ticketId: string, user: UserPayload) {
    const role = this.getRole(user);
    const ticket = await this.ticketRepository.findById(ticketId, {
      includeArchived: true,
    });

    if (!ticket) {
      this.logger.warn(`Ticket não encontrado para arquivamento — id: ${ticketId}`);
      throw new NotFoundException('Ticket não encontrado');
    }

    if (role === Role.CLIENT) {
      this.logger.warn(
        `Cliente tentou arquivar ticket — ticketId: ${ticketId}, userId: ${user.sub}`,
      );
      throw new ForbiddenException('Clientes não podem arquivar tickets');
    }

    if (role === Role.AGENT && ticket.agentId !== user.sub) {
      this.logger.warn(
        `Agente não atribuído tentou arquivar ticket — ticketId: ${ticketId}, userId: ${user.sub}, assignedAgentId: ${ticket.agentId ?? 'nenhum'}`,
      );
      throw new ForbiddenException(
        'Apenas o agente atribuído pode arquivar este ticket',
      );
    }

    if (ticket.isArchived) {
      this.logger.log(`Ticket já estava arquivado — id: ${ticketId}`);
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

    this.logger.log(`Ticket arquivado — id: ${ticketId}`);

    return archivedTicket;
  }

  async unarchiveTicket(ticketId: string, user: UserPayload) {
    const role = this.getRole(user);
    const ticket = await this.ticketRepository.findById(ticketId, {
      includeArchived: true,
    });

    if (!ticket) {
      this.logger.warn(
        `Ticket não encontrado para desarquivamento — id: ${ticketId}`,
      );
      throw new NotFoundException('Ticket não encontrado');
    }

    if (role === Role.CLIENT) {
      this.logger.warn(
        `Cliente tentou desarquivar ticket — ticketId: ${ticketId}, userId: ${user.sub}`,
      );
      throw new ForbiddenException('Clientes não podem desarquivar tickets');
    }

    if (role === Role.AGENT && ticket.agentId !== user.sub) {
      this.logger.warn(
        `Agente não atribuído tentou desarquivar ticket — ticketId: ${ticketId}, userId: ${user.sub}, assignedAgentId: ${ticket.agentId ?? 'nenhum'}`,
      );
      throw new ForbiddenException(
        'Apenas o agente atribuído pode desarquivar este ticket',
      );
    }

    if (!ticket.isArchived) {
      this.logger.log(`Ticket já estava desarquivado — id: ${ticketId}`);
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

    this.logger.log(`Ticket desarquivado — id: ${ticketId}`);

    return unarchivedTicket;
  }

  async deleteTicket(ticketId: string, user: UserPayload): Promise<void> {
    const role = this.getRole(user);
    if (role !== Role.ADMIN) {
      this.logger.warn(
        `Usuário sem permissão tentou excluir ticket — ticketId: ${ticketId}, userId: ${user.sub}, role: ${role}`,
      );
      throw new ForbiddenException('Apenas administradores podem excluir tickets');
    }

    const ticket = await this.ticketRepository.findById(ticketId, {
      includeArchived: true,
    });

    if (!ticket) {
      this.logger.warn(`Ticket não encontrado para exclusão lógica — id: ${ticketId}`);
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

    this.logger.log(`Ticket excluído logicamente — id: ${ticketId}`);
  }

  private buildVisibilityWhere({
    user,
    status,
    companyId,
    agentId,
    clientId,
    includeArchived,
    agentSupportGroupIds = [],
  }: BuildVisibilityWhereInput): Prisma.TicketWhereInput {
    const role = this.getRole(user);

    const baseWhere: Prisma.TicketWhereInput = {
      deletedAt: null,
      ...(includeArchived ? {} : { isArchived: false }),
      ...(status ? { status } : {}),
    };

    if (role === Role.CLIENT) {
      if (clientId && clientId !== user.sub) {
        this.logger.warn(
          `Cliente tentou listar tickets de outro cliente — userId: ${user.sub}, filterClientId: ${clientId}`,
        );
        throw new ForbiddenException(
          'Clientes podem consultar apenas seus próprios tickets',
        );
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
        ...(companyId ? { companyId } : {}),
        ...(agentId ? { agentId } : {}),
        ...(clientId ? { clientId } : {}),
      };
    }

    if (role === Role.AGENT) {
      const visibilityRules: Prisma.TicketWhereInput[] = [{ agentId: user.sub }];

      if (agentSupportGroupIds.length > 0) {
        visibilityRules.push({
          supportGroupId: {
            in: agentSupportGroupIds,
          },
        });
      }

      return {
        ...baseWhere,
        ...(companyId ? { companyId } : {}),
        ...(agentId ? { agentId } : {}),
        ...(clientId ? { clientId } : {}),
        OR: visibilityRules,
      };
    }

    this.logger.warn(`Perfil de usuário inválido para listagem — role: ${user.role}`);
    throw new ForbiddenException('Perfil de usuário inválido');
  }

  private async assertTicketVisibility(
    ticket: TicketWithRelations,
    user: UserPayload,
  ): Promise<void> {
    const role = this.getRole(user);

    if (role === Role.CLIENT && ticket.clientId !== user.sub) {
      this.logger.warn(
        `Cliente sem acesso tentou consultar ticket — ticketId: ${ticket.id}, userId: ${user.sub}, ownerId: ${ticket.clientId}`,
      );
      throw new ForbiddenException('Você não tem acesso a este ticket');
    }

    if (role === Role.AGENT) {
      if (ticket.agentId === user.sub) {
        return;
      }

      const agentSupportGroupIds = await this.getAgentSupportGroupIds(user.sub);
      if (
        ticket.supportGroupId
        && agentSupportGroupIds.includes(ticket.supportGroupId)
      ) {
        return;
      }

      this.logger.warn(
        `Agente sem acesso tentou consultar ticket — ticketId: ${ticket.id}, userId: ${user.sub}, supportGroupId: ${ticket.supportGroupId ?? 'nenhum'}`,
      );
      throw new ForbiddenException('Você não tem acesso a este ticket');
    }
  }

  private async getAgentSupportGroupIds(agentId: string): Promise<string[]> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        agentGroups: {
          where: {
            supportGroup: {
              deletedAt: null,
              isActive: true,
            },
          },
          select: {
            supportGroupId: true,
          },
        },
      },
    });

    if (!agent) {
      this.logger.warn(
        `Agente não encontrado ao carregar grupos de suporte — agentId: ${agentId}`,
      );
      return [];
    }

    return agent.agentGroups.map((group) => group.supportGroupId);
  }

  private normalizePage(page: number): number {
    if (!Number.isFinite(page) || page < 1) {
      return 1;
    }

    return Math.floor(page);
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isFinite(limit) || limit < 1) {
      return 10;
    }

    const normalizedLimit = Math.floor(limit);
    return Math.min(normalizedLimit, 100);
  }

  private getRole(user: UserPayload): Role {
    if (user.role === Role.CLIENT) return Role.CLIENT;
    if (user.role === Role.AGENT) return Role.AGENT;
    if (user.role === Role.ADMIN) return Role.ADMIN;

    this.logger.warn(`Role inválido recebido no token — role: ${user.role}`);
    throw new ForbiddenException('Perfil de usuário inválido');
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
      this.logger.warn(
        `Transição de status inválida — de: ${currentStatus}, para: ${newStatus}`,
      );
      throw new BadRequestException(
        `Transição de status inválida de ${currentStatus} para ${newStatus}`,
      );
    }
  }
}
