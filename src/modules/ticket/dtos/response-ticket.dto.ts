import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SupportLevel,
  TicketStatus,
  TicketPriority,
} from '../../../../generated/prisma/enums';

class ResponseTicketClientDto {
  @ApiProperty({
    example: '',
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
    example: '',
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
    example: '',
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
    example: '',
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
    example: '',
    description: 'ID do assunto do ticket',
  })
  id: string;

  @ApiProperty({
    example: 'Fatura',
    description: 'Nome do assunto do ticket',
  })
  name: string;
}

class ResponseTicketTriageAnswerDto {
  @ApiProperty({
    example: 'O problema envolve autenticação na plataforma?',
    description: 'Pergunta apresentada ao cliente na triagem',
  })
  question: string;

  @ApiProperty({
    example: 'Sim',
    description: 'Resposta escolhida pelo cliente na triagem',
  })
  answer: string;
}

class ResponseTicketTriageSummaryDto {
  @ApiProperty({
    example: '',
    description: 'ID do nó folha que encerrou a triagem',
  })
  triageLeafId: string;

  @ApiProperty({
    type: [ResponseTicketTriageAnswerDto],
    description: 'Sequência de perguntas e respostas da triagem',
  })
  answers: ResponseTicketTriageAnswerDto[];
}

export class ResponseTicketDto {
  @ApiProperty({
    example: '',
    description: 'ID do ticket (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 12345,
    description: 'Número público do ticket para exibição no front',
  })
  ticketNumber: number;

  @ApiProperty({
    example: '',
    description: 'ID da empresa associada ao ticket',
  })
  companyId: string;

  @ApiProperty({
    example: '',
    description: 'ID do cliente que abriu o ticket',
  })
  clientId: string;

  @ApiProperty({
    example: '',
    description: 'ID do agente atribuído ao ticket',
    nullable: true,
  })
  agentId?: string | null;

  @ApiProperty({
    example: '',
    description: 'ID do grupo de suporte',
    nullable: true,
  })
  supportGroupId?: string | null;

  @ApiProperty({
    example: '',
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

  @ApiPropertyOptional({
    type: ResponseTicketTriageSummaryDto,
    description: 'Resumo da triagem preenchida pelo cliente',
  })
  triageSummary?: ResponseTicketTriageSummaryDto | null;
}

class ResponseTicketPaginationMetaDto {
  @ApiProperty({
    example: 42,
    description: 'Quantidade total de tickets encontrados',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Página atual',
  })
  page: number;

  @ApiProperty({
    example: 5,
    description: 'Última página disponível',
  })
  lastPage: number;

  @ApiProperty({
    example: 10,
    description: 'Quantidade de registros por página',
  })
  limit: number;
}

export class ResponseTicketPaginationDto {
  @ApiProperty({
    type: [ResponseTicketDto],
    description: 'Tickets retornados na página atual',
  })
  data: ResponseTicketDto[];

  @ApiProperty({
    type: ResponseTicketPaginationMetaDto,
    description: 'Metadados de paginação',
  })
  meta: ResponseTicketPaginationMetaDto;
}
