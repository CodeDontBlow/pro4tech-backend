import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SupportLevel,
  TicketStatus,
  TicketPriority,
} from '../../../../generated/prisma/enums';

class ResponseTicketClientDto {
  @ApiProperty({
    example: 'd6481f48-1f3e-4fd3-8ad0-68066ccbd413',
    description: 'Client ID',
  })
  id: string;

  @ApiProperty({
    example: 'Maria Souza',
    description: 'Client name',
  })
  name: string;
}

class ResponseTicketAgentDto {
  @ApiProperty({
    example: '2c0835d1-4036-4f40-a021-fdd033fc2f8d',
    description: 'Agent ID',
  })
  id: string;

  @ApiProperty({
    enum: SupportLevel,
    example: 'LEVEL_1',
    description: 'Agent support level',
  })
  supportLevel: SupportLevel;
}

class ResponseTicketCompanyDto {
  @ApiProperty({
    example: 'f3c86ae4-7dbf-4f11-bf0a-5cc00ea259ec',
    description: 'Company ID',
  })
  id: string;

  @ApiProperty({
    example: 'ACME LTDA',
    description: 'Company name',
  })
  name: string;
}

class ResponseTicketSupportGroupDto {
  @ApiProperty({
    example: '4f2f77ce-dddd-47e5-93ea-81c1f0fa542f',
    description: 'Support group ID',
  })
  id: string;

  @ApiProperty({
    example: 'Atendimento N1',
    description: 'Support group name',
  })
  name: string;
}

class ResponseTicketSubjectDto {
  @ApiProperty({
    example: 'f56fafad-842e-47d1-823f-5748e7df80c0',
    description: 'Ticket subject ID',
  })
  id: string;

  @ApiProperty({
    example: 'Fatura',
    description: 'Ticket subject name',
  })
  name: string;
}

export class ResponseTicketDto {
  @ApiProperty({
    example: '1a2b3c4d-5e6f-7890-abcd-1234567890ab',
    description: 'Ticket ID (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'company-123',
    description: 'Company ID associated with this ticket',
  })
  companyId: string;

  @ApiProperty({
    example: 'user-456',
    description: 'Client ID who opened this ticket',
  })
  clientId: string;

  @ApiProperty({
    example: 'agent-789',
    description: 'Agent ID assigned to this ticket',
    nullable: true,
  })
  agentId?: string | null;

  @ApiProperty({
    example: 'group-111',
    description: 'Support Group ID',
    nullable: true,
  })
  supportGroupId?: string | null;

  @ApiProperty({
    example: 'subject-222',
    description: 'Ticket Subject ID',
    nullable: true,
  })
  subjectId?: string | null;

  @ApiProperty({
    example: 'OPENED',
    enum: TicketStatus,
    description: 'Current status of the ticket',
  })
  status: TicketStatus;

  @ApiProperty({
    example: 'HIGH',
    enum: TicketPriority,
    description: 'Priority level',
    nullable: true,
  })
  priority?: TicketPriority | null;

  @ApiProperty({
    example: 5,
    description: 'Rating score (0-5)',
    nullable: true,
  })
  ratingScore?: number | null;

  @ApiProperty({
    example: 'Great service!',
    description: 'Rating comment from client',
    nullable: true,
  })
  ratingComment?: string | null;

  @ApiProperty({
    example: '2026-04-04T10:00:00Z',
    description: 'When the ticket was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-04-04T11:30:00Z',
    description: 'Last time the ticket was updated',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '2026-04-04T12:00:00Z',
    description: 'When the ticket was closed',
    nullable: true,
  })
  closedAt?: Date | null;

  @ApiProperty({
    example: false,
    description: 'Whether the ticket is archived',
  })
  isArchived: boolean;

  @ApiProperty({
    example: '2026-04-10T12:00:00Z',
    description: 'When the ticket was soft deleted',
    nullable: true,
  })
  deletedAt?: Date | null;

  @ApiPropertyOptional({
    type: ResponseTicketClientDto,
    description: 'Lightweight client data',
  })
  client?: ResponseTicketClientDto;

  @ApiPropertyOptional({
    type: ResponseTicketAgentDto,
    description: 'Lightweight agent data',
  })
  agent?: ResponseTicketAgentDto | null;

  @ApiPropertyOptional({
    type: ResponseTicketCompanyDto,
    description: 'Lightweight company data',
  })
  company?: ResponseTicketCompanyDto;

  @ApiPropertyOptional({
    type: ResponseTicketSupportGroupDto,
    description: 'Lightweight support group data',
  })
  supportGroup?: ResponseTicketSupportGroupDto | null;

  @ApiPropertyOptional({
    type: ResponseTicketSubjectDto,
    description: 'Lightweight subject data',
  })
  subject?: ResponseTicketSubjectDto | null;
}
