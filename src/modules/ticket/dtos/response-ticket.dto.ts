import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '../../../../generated/prisma/enums';

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
    enum: ['TRIAGE', 'OPENED', 'ESCALATED', 'CLOSED', 'RESOLVED'],
    description: 'Current status of the ticket',
  })
  status: TicketStatus;

  @ApiProperty({
    example: 'HIGH',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'HIGHEST'],
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

  // Relations (optional - for includes)
  client?: any;
  agent?: any;
  company?: any;
  supportGroup?: any;
  subject?: any;
}
