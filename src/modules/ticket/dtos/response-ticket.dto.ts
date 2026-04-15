import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SupportLevel,
  TicketStatus,
  TicketPriority,
} from '../../../../generated/prisma/enums';

class ResponseTicketClientDto {
  @ApiProperty({
    example: 'd6481f48-1f3e-4fd3-8ad0-68066ccbd413',
    description: 'ID do cliente',
  })
  id: string;

  @ApiProperty({
    example: 'Maria Souza',
    description: 'Nome do cliente',
  })
  name: string;
}

class ResponseTicketAgentDto {
  @ApiProperty({
    example: '2c0835d1-4036-4f40-a021-fdd033fc2f8d',
    description: 'ID do agente',
  })
  id: string;

  @ApiProperty({
    enum: SupportLevel,
    example: 'LEVEL_1',
    description: 'Nível de suporte do agente',
  })
  supportLevel: SupportLevel;
}

class ResponseTicketCompanyDto {
  @ApiProperty({
    example: 'f3c86ae4-7dbf-4f11-bf0a-5cc00ea259ec',
    description: 'ID da empresa',
  })
  id: string;

  @ApiProperty({
    example: 'ACME LTDA',
    description: 'Nome da empresa',
  })
  name: string;
}

class ResponseTicketSupportGroupDto {
  @ApiProperty({
    example: '4f2f77ce-dddd-47e5-93ea-81c1f0fa542f',
    description: 'ID do grupo de suporte',
  })
  id: string;

  @ApiProperty({
    example: 'Atendimento N1',
    description: 'Nome do grupo de suporte',
  })
  name: string;
}

class ResponseTicketSubjectDto {
  @ApiProperty({
    example: 'f56fafad-842e-47d1-823f-5748e7df80c0',
    description: 'ID do assunto do ticket',
  })
  id: string;

  @ApiProperty({
    example: 'Fatura',
    description: 'Nome do assunto do ticket',
  })
  name: string;
}

export class ResponseTicketDto {
  @ApiProperty({
    example: '1a2b3c4d-5e6f-7890-abcd-1234567890ab',
    description: 'ID do ticket (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'company-123',
    description: 'ID da empresa associada ao ticket',
  })
  companyId: string;

  @ApiProperty({
    example: 'user-456',
    description: 'ID do cliente que abriu o ticket',
  })
  clientId: string;

  @ApiProperty({
    example: 'agent-789',
    description: 'ID do agente atribuído ao ticket',
    nullable: true,
  })
  agentId?: string | null;

  @ApiProperty({
    example: 'group-111',
    description: 'ID do grupo de suporte',
    nullable: true,
  })
  supportGroupId?: string | null;

  @ApiProperty({
    example: 'subject-222',
    description: 'ID do assunto do ticket',
    nullable: true,
  })
  subjectId?: string | null;

  @ApiProperty({
    example: 'OPENED',
    enum: TicketStatus,
    description: 'Status atual do ticket',
  })
  status: TicketStatus;

  @ApiProperty({
    example: 'HIGH',
    enum: TicketPriority,
    description: 'Nível de prioridade',
    nullable: true,
  })
  priority?: TicketPriority | null;

  @ApiProperty({
    example: 5,
    description: 'Nota de avaliação (0-5)',
    nullable: true,
  })
  ratingScore?: number | null;

  @ApiProperty({
    example: 'Great service!',
    description: 'Comentário de avaliação do cliente',
    nullable: true,
  })
  ratingComment?: string | null;

  @ApiProperty({
    example: '2026-04-04T10:00:00Z',
    description: 'Data/hora de criação do ticket',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-04-04T11:30:00Z',
    description: 'Data/hora da última atualização do ticket',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '2026-04-04T12:00:00Z',
    description: 'Data/hora de fechamento do ticket',
    nullable: true,
  })
  closedAt?: Date | null;

  @ApiProperty({
    example: false,
    description: 'Indica se o ticket está arquivado',
  })
  isArchived: boolean;

  @ApiProperty({
    example: '2026-04-10T12:00:00Z',
    description: 'Data/hora da exclusão lógica do ticket',
    nullable: true,
  })
  deletedAt?: Date | null;

  @ApiPropertyOptional({
    type: ResponseTicketClientDto,
    description: 'Dados reduzidos do cliente',
  })
  client?: ResponseTicketClientDto;

  @ApiPropertyOptional({
    type: ResponseTicketAgentDto,
    description: 'Dados reduzidos do agente',
  })
  agent?: ResponseTicketAgentDto | null;

  @ApiPropertyOptional({
    type: ResponseTicketCompanyDto,
    description: 'Dados reduzidos da empresa',
  })
  company?: ResponseTicketCompanyDto;

  @ApiPropertyOptional({
    type: ResponseTicketSupportGroupDto,
    description: 'Dados reduzidos do grupo de suporte',
  })
  supportGroup?: ResponseTicketSupportGroupDto | null;

  @ApiPropertyOptional({
    type: ResponseTicketSubjectDto,
    description: 'Dados reduzidos do assunto',
  })
  subject?: ResponseTicketSubjectDto | null;
}
