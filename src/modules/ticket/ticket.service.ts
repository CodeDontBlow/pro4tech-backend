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
  companyId?: string;
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
      this.logger.warn(
        `Tentativa de criação de ticket por perfil inválido — role: ${role}`,
      );
      throw new ForbiddenException('Apenas clientes podem criar tickets');
    }

    if (dto.clientId !== user.sub) {
      this.logger.warn(
        `clientId divergente na criação de ticket — authUser: ${user.sub}, payloadClientId: ${dto.clientId}`,
      );
      throw new ForbiddenException(
        'clientId deve corresponder ao usuário autenticado',
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
      this.logger.warn(
        `Cliente não encontrado ou inativo na criação de ticket — clientId: ${dto.clientId}`,
      );
      throw new NotFoundException('Cliente não encontrado ou inativo');
    }

    const ticket = await this.ticketRepository.create({
      companyId: client.companyId,
      clientId: client.id,
      supportGroupId: dto.supportGroupId,
      subjectId: dto.subjectId,
      priority: dto.priority,
    });

    this.logger.log(`Ticket criado — id: ${ticket.id}, clientId: ${client.id}`);
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

    this.assertTicketVisibility(ticket, user);

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

    this.assertTicketVisibility(ticket, user);
    return ticket;
  }

  async listTickets({
    user,
    status,
    companyId,
    agentId,
    clientId,
    includeArchived = false,
  }: ListTicketsInput) {
    const where = this.buildVisibilityWhere({
      user,
      status,
      companyId,
      agentId,
      clientId,
      includeArchived,
    });

    const tickets = await this.ticketRepository.findMany(where);
    this.logger.log(
      `Listagem de tickets concluída — role: ${user.role}, userId: ${user.sub}, total: ${tickets.length}`,
    );

    return tickets;
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
  }: ListTicketsInput): Prisma.TicketWhereInput {
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
      return {
        ...baseWhere,
        ...(companyId ? { companyId } : {}),
        ...(agentId ? { agentId } : {}),
        ...(clientId ? { clientId } : {}),
      };
    }

    this.logger.warn(`Perfil de usuário inválido para listagem — role: ${user.role}`);
    throw new ForbiddenException('Perfil de usuário inválido');
  }

  private assertTicketVisibility(
    ticket: TicketWithRelations,
    user: UserPayload,
  ) {
    const role = this.getRole(user);

    if (role === Role.CLIENT && ticket.clientId !== user.sub) {
      this.logger.warn(
        `Cliente sem acesso tentou consultar ticket — ticketId: ${ticket.id}, userId: ${user.sub}, ownerId: ${ticket.clientId}`,
      );
      throw new ForbiddenException('Você não tem acesso a este ticket');
    }

    if (role === Role.AGENT) {
      return;
    }
  }

  private getRole(user: UserPayload): Role {
    if (user.role === Role.CLIENT) return Role.CLIENT;
    if (user.role === Role.AGENT) return Role.AGENT;
    if (user.role === Role.ADMIN) return Role.ADMIN;

    this.logger.warn(`Role inválido recebido no token — role: ${user.role}`);
    throw new ForbiddenException('Perfil de usuário inválido');
  }

  private async validateSupportGroup(supportGroupId: string): Promise<void> {
    const supportGroup = await this.supportGroupRepository.findById(supportGroupId);
    if (!supportGroup) {
      this.logger.warn(`Grupo de suporte não encontrado — id: ${supportGroupId}`);
      throw new NotFoundException(
        `Grupo de suporte ${supportGroupId} não encontrado`,
      );
    }
    if (!supportGroup.isActive) {
      this.logger.warn(`Grupo de suporte inativo — id: ${supportGroupId}`);
      throw new BadRequestException('Grupo de suporte está inativo');
    }
  }

  private async validateSubject(subjectId: string): Promise<void> {
    const subject = await this.ticketSubjectRepository.findById(subjectId);
    if (!subject) {
      this.logger.warn(`Assunto do ticket não encontrado — id: ${subjectId}`);
      throw new NotFoundException(
        `Assunto do ticket ${subjectId} não encontrado`,
      );
    }
    if (!subject.isActive) {
      this.logger.warn(`Assunto do ticket inativo — id: ${subjectId}`);
      throw new BadRequestException('Assunto do ticket está inativo');
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
      this.logger.warn(
        `Transição de status inválida — de: ${currentStatus}, para: ${newStatus}`,
      );
      throw new BadRequestException(
        `Transição de status inválida de ${currentStatus} para ${newStatus}`,
      );
    }
  }
}
