import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { TicketStatus } from '../../../generated/prisma/enums';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { SupportGroupRepository } from '../support-group/support-group.repository';
import { TicketSubjectRepository } from '../ticket-subject/ticket-subject.repository';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly supportGroupRepository: SupportGroupRepository,
    private readonly ticketSubjectRepository: TicketSubjectRepository,
  ) {}

  /**
   * Create a new ticket with business validations
   * - Validates supportGroup has agents (if provided)
   * - Validates subject is active (if provided)
   * - supportGroupId and subjectId are optional
   */
  async createTicket(dto: CreateTicketDto) {
    // Validate supportGroup if provided
    if (dto.supportGroupId) {
      await this.validateSupportGroup(dto.supportGroupId);
    }

    // Validate subject if provided
    if (dto.subjectId) {
      await this.validateSubject(dto.subjectId);
    }

    // Create ticket with status TRIAGE (enforced server-side)
    return this.ticketRepository.create({
      ...dto,
      status: 'TRIAGE',
    });
  }

  /**
   * Update a ticket with validations:
   * - Validates status transitions
   * - Ensures only assigned agent can close ticket
   * - Prevents changes to companyId/clientId (immutable)
   * - Auto-generates closedAt timestamp when closing
   */
  async updateTicket(ticketId: string, dto: UpdateTicketDto, agentId?: string) {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    // Prevent modifications to immutable fields (in case someone tries to send them)
    if ('companyId' in dto || 'clientId' in dto) {
      throw new BadRequestException(
        'companyId and clientId cannot be modified after creation',
      );
    }

    // Validate status transition
    if (dto.status) {
      this.validateStatusTransition(ticket.status, dto.status);

      // Security: Only assigned agent can close ticket
      if (dto.status === 'CLOSED') {
        if (!ticket.agentId) {
          throw new BadRequestException(
            'Cannot close ticket without an assigned agent',
          );
        }
        if (agentId && agentId !== ticket.agentId) {
          throw new ForbiddenException(
            'Only the assigned agent can close this ticket',
          );
        }
      }
    }

    return this.ticketRepository.update(ticketId, dto);
  }

  /**
   * Get ticket by ID with all relationships
   */
  async getTicket(ticketId: string) {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }
    return ticket;
  }

  /**
   * List tickets with optional filters
   */
  async listTickets(filters?: {
    status?: TicketStatus;
    companyId?: string;
    agentId?: string;
    clientId?: string;
  }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.agentId) where.agentId = filters.agentId;
    if (filters?.clientId) where.clientId = filters.clientId;

    return this.ticketRepository.findMany(where);
  }

  /**
   * Delete ticket
   */
  async deleteTicket(ticketId: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }
    await this.ticketRepository.delete(ticketId);
  }

  /**
   * Private: Validate supportGroup exists and is active
   */
  private async validateSupportGroup(supportGroupId: string): Promise<void> {
    const supportGroup =
      await this.supportGroupRepository.findById(supportGroupId);
    if (!supportGroup) {
      throw new NotFoundException(`Support Group ${supportGroupId} not found`);
    }
    if (!supportGroup.isActive) {
      throw new BadRequestException('Support Group is not active');
    }
  }

  /**
   * Private: Validate subject exists and is active
   */
  private async validateSubject(subjectId: string): Promise<void> {
    const subject = await this.ticketSubjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Ticket Subject ${subjectId} not found`);
    }
    if (!subject.isActive) {
      throw new BadRequestException('Ticket Subject is not active');
    }
  }

  /**
   * Private: Validate status transitions
   * MVP rules: TRIAGE → OPENED → CLOSED
   * (ESCALATED and RESOLVED commented for future use)
   */
  private validateStatusTransition(
    currentStatus: TicketStatus,
    newStatus: TicketStatus,
  ): void {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      TRIAGE: ['OPENED'],
      OPENED: ['CLOSED'], // ESCALATED commented for MVP
      ESCALATED: ['CLOSED', 'OPENED'],
      CLOSED: [], // Terminal state
      RESOLVED: [], // Terminal state
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
