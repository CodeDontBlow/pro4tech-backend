import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupportLevel, Role, ChatStatus } from 'generated/prisma/client';

class UserNestedResponseAgentDto {

  @ApiProperty({
    example: 'agent@empresa.com',
    description: 'E-mail do agent',
  })
  email: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do agent',
  })
  name: string;

  @ApiPropertyOptional({
    example: '+5511999999999',
    description: 'Telefone do agent (formato E.164)',
  })
  phone?: string;

  @ApiProperty({
    example: 'AGENT',
    enum: Role,
    description: 'Sempre será AGENT',
  })
  role: Role;

  @ApiProperty({
    example: 'ONLINE',
    enum: ChatStatus,
    description: 'Status atual de chat',
  })
  chatStatus: ChatStatus;

  @ApiPropertyOptional({
    example: '2026-04-02T10:30:00Z',
    description: 'Último visto do agent',
  })
  lastSeen?: Date;

  @ApiProperty({
    example: true,
    description: 'Se o agent está ativo',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2026-04-02T10:30:00Z',
    description: 'Data de criação',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-04-02T10:30:00Z',
    description: 'Data de última atualização',
  })
  updatedAt: Date;
}

/**
 * DTO de resposta para Agent (com dados do User aninhado)
 */
export class ResponseAgentDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'ID do agent (mesmo que User ID)',
  })
  id: string;

  @ApiProperty({
    example: 'LEVEL_1',
    description: 'Nível de suporte atribuído',
    enum: SupportLevel,
  })
  supportLevel: SupportLevel;

  @ApiProperty({
    example: true,
    description: 'Se o agent pode responder tickets',
  })
  canAnswer: boolean;

  @ApiProperty({
    description: 'Dados do usuário relacionado',
    type: UserNestedResponseAgentDto,
  })
  user: UserNestedResponseAgentDto;

  @ApiPropertyOptional({
    example: '2026-04-02T10:30:00Z',
    description: 'Data de criação do agent',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    example: '2026-04-02T10:30:00Z',
    description: 'Data de última atualização do agent',
  })
  updatedAt?: Date;
}
