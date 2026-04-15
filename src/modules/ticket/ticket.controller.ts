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
  ApiQuery,
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
import { TicketStatus } from '../../../generated/prisma/enums';

@ApiBearerAuth()
@ApiTags('Ticket')
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * POST /tickets
   * Create a new ticket
   * - Subject and support group must come from frontend triage result
   */
  @Post()
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: ResponseTicketDto,
  })
  async create(
    @Body() dto: CreateTicketDto,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.createTicket(dto, user);
  }

  /**
   * GET /tickets/:id
   * Get ticket by ID with all relationships
   */
  @Get(':id')
  @Roles(Role.CLIENT, Role.AGENT, Role.ADMIN)
  @ApiQuery({
    name: 'includeArchived',
    required: false,
    type: Boolean,
    description: 'Set true to include archived tickets in lookup',
  })
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket found',
    type: ResponseTicketDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getById(
    @Param('id') ticketId: string,
    @AuthUser() user: UserPayload,
    @Query('includeArchived') includeArchived?: string,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.getTicket(
      ticketId,
      user,
      includeArchived === 'true',
    );
  }

  /**
   * GET /tickets
   * List tickets with optional filters
   */
  @Get()
  @Roles(Role.CLIENT, Role.AGENT, Role.ADMIN)
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TicketStatus,
    description: 'Filter by ticket status',
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    type: String,
    description: 'Filter by assigned agent id',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    type: String,
    description: 'Filter by client id',
  })
  @ApiQuery({
    name: 'includeArchived',
    required: false,
    type: Boolean,
    description: 'Set true to include archived tickets',
  })
  @ApiOperation({ summary: 'List tickets with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of tickets',
    type: [ResponseTicketDto],
  })
  async list(
    @AuthUser() user: UserPayload,
    @Query('status') status?: TicketStatus,
    @Query('agentId') agentId?: string,
    @Query('clientId') clientId?: string,
    @Query('includeArchived') includeArchived?: string,
  ): Promise<ResponseTicketDto[]> {
    return this.ticketService.listTickets({
      user,
      status,
      agentId,
      clientId,
      includeArchived: includeArchived === 'true',
    });
  }

  /**
   * PATCH /tickets/:id
   * Update ticket (status, priority, rating, etc.)
   */
  @Patch(':id')
  @Roles(Role.CLIENT, Role.AGENT, Role.ADMIN)
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
    return this.ticketService.updateTicket(ticketId, dto, user);
  }

  @Patch(':id/archive')
  @Roles(Role.AGENT, Role.ADMIN)
  @ApiOperation({ summary: 'Archive ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket archived successfully',
    type: ResponseTicketDto,
  })
  async archive(
    @Param('id') ticketId: string,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.archiveTicket(ticketId, user);
  }

  @Patch(':id/unarchive')
  @Roles(Role.AGENT, Role.ADMIN)
  @ApiOperation({ summary: 'Unarchive ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket unarchived successfully',
    type: ResponseTicketDto,
  })
  async unarchive(
    @Param('id') ticketId: string,
    @AuthUser() user: UserPayload,
  ): Promise<ResponseTicketDto> {
    return this.ticketService.unarchiveTicket(ticketId, user);
  }

  /**
   * DELETE /tickets/:id
   * Soft delete ticket
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete ticket' })
  @ApiResponse({ status: 204, description: 'Ticket deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async delete(
    @Param('id') ticketId: string,
    @AuthUser() user: UserPayload,
  ): Promise<void> {
    return this.ticketService.deleteTicket(ticketId, user);
  }
}
