import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatStatus, SupportLevel } from 'generated/prisma/client';

export class ResponseAvailableAgentDto {
  @ApiProperty({
    example: '0195f174-3fa5-7d74-b83c-54b718885e45',
    description: 'Agent id',
  })
  agentId: string;

  @ApiProperty({
    example: 'Ana Souza',
    description: 'Agent display name',
  })
  name: string;

  @ApiProperty({
    enum: SupportLevel,
    example: SupportLevel.LEVEL_1,
    description: 'Agent support level',
  })
  supportLevel: SupportLevel;

  @ApiProperty({
    example: true,
    description: 'Whether this agent can receive ticket assignments',
  })
  canAnswer: boolean;

  @ApiProperty({
    enum: ChatStatus,
    example: ChatStatus.ONLINE,
    description: 'Current chat status from database',
  })
  chatStatus: ChatStatus;

  @ApiPropertyOptional({
    example: '2026-04-23T13:22:00.000Z',
    description: 'Last seen timestamp, when available',
  })
  lastSeen?: Date;
}

export class ResponseAvailableAgentsDto {
  @ApiProperty({
    example: 2,
    description: 'Total available agents in this response',
  })
  total: number;

  @ApiProperty({
    type: ResponseAvailableAgentDto,
    isArray: true,
    description: 'Available agents',
  })
  agents: ResponseAvailableAgentDto[];
}
