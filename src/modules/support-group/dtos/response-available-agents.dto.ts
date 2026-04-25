import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatStatus, SupportLevel } from 'generated/prisma/client';

export class ResponseAvailabilityGroupAgentDto {
  @ApiProperty({
    example: '0195f174-3fa5-7d74-b83c-54b718885e45',
    description: 'ID do agente',
  })
  agentId: string;

  @ApiProperty({
    example: 'Ana Souza',
    description: 'Nome de exibição do agente',
  })
  name: string;

  @ApiProperty({
    enum: SupportLevel,
    example: SupportLevel.LEVEL_1,
    description: 'Nível de suporte do agente',
  })
  supportLevel: SupportLevel;

  @ApiProperty({
    example: true,
    description: 'Indica se o agente pode receber atribuições de chamados',
  })
  canAnswer: boolean;

  @ApiProperty({
    enum: ChatStatus,
    example: ChatStatus.ONLINE,
    description: 'Status atual de chat no banco de dados',
  })
  chatStatus: ChatStatus;

  @ApiPropertyOptional({
    example: '2026-04-23T13:22:00.000Z',
    description: 'Data/hora do último acesso, quando disponível',
  })
  lastSeen?: Date;
}

export class ResponseAvailabilityGroupDto {
  @ApiProperty({
    example: '0195f174-3fa5-7d74-b83c-54b718885e45',
    description: 'ID do grupo de suporte',
  })
  supportGroupId: string;

  @ApiProperty({
    example: 'Suporte Nível 1',
    description: 'Nome do grupo de suporte',
  })
  supportGroupName: string;

  @ApiProperty({
    example: 4,
    description: 'Total de agentes disponíveis neste grupo de suporte',
  })
  availableCount: number;

  @ApiProperty({
    type: ResponseAvailabilityGroupAgentDto,
    isArray: true,
    description: 'Agentes disponíveis dentro deste grupo de suporte',
  })
  agents: ResponseAvailabilityGroupAgentDto[];
}

export class ResponseAvailableAgentsSummaryDto {
  @ApiProperty({
    example: 8,
    description:
      'Total único de agentes disponíveis no escopo. O mesmo agente é contado uma única vez, mesmo que pertença a vários grupos.',
  })
  totalUniqueAvailableAgents: number;

  @ApiProperty({
    type: ResponseAvailabilityGroupDto,
    isArray: true,
    description: 'Disponibilidade agrupada por grupo de suporte',
  })
  groups: ResponseAvailabilityGroupDto[];
}
