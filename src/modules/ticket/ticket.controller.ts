import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { ResponseTicketDto } from './dtos/response-ticket.dto';
import {
  AuthUser,
  UserPayload,
} from 'src/common/decorators/auth-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/client';

@ApiBearerAuth()
@Roles(Role.AGENT, Role.ADMIN)
@ApiTags('Ticket')
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * POST /tickets
   * Create a new ticket
   * - supportGroupId and subjectId must come from TriageRule frontend triage
   */
  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: ResponseTicketDto,
  })
  async create(@Body() dto: CreateTicketDto): Promise<ResponseTicketDto> {
    return this.ticketService.createTicket(dto);
  }

  /**
   * GET /tickets/:id
   * Get ticket by ID with all relationships
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket found',
    type: ResponseTicketDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getById(@Param('id') ticketId: string): Promise<ResponseTicketDto> {
    return this.ticketService.getTicket(ticketId);
  }

  /**
   * GET /tickets
   * List tickets with optional filters
   */
  @Get()
  @ApiOperation({ summary: 'List tickets with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of tickets',
    type: [ResponseTicketDto],
  })
  async list(
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
    @Query('agentId') agentId?: string,
    @Query('clientId') clientId?: string,
  ): Promise<ResponseTicketDto[]> {
    return this.ticketService.listTickets({
      status: status as any,
      companyId,
      agentId,
      clientId,
    });
  }

  /**
   * PATCH /tickets/:id
   * Update ticket (status, priority, rating, etc.)
   * Security: Only assigned agent can update their own tickets to CLOSED status
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
    type: ResponseTicketDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition or immutable field change',
  })
  @ApiResponse({
    status: 403,
    description: 'Only assigned agent can close ticket',
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async update(
    @Param('id') ticketId: string,
    @Body() dto: UpdateTicketDto,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.updateTicket(ticketId, dto, user.sub);
  }

  /**
   * DELETE /tickets/:id
   * Delete ticket
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket' })
  @ApiResponse({ status: 204, description: 'Ticket deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async delete(@Param('id') ticketId: string): Promise<void> {
    return this.ticketService.deleteTicket(ticketId);
  }
}
