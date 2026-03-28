import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, ChatStatus } from 'generated/prisma/client';

export class ResponseUserDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'ID do usuário',
  })
  id: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'ID da empresa',
  })
  companyId: string;

  @ApiPropertyOptional({
    example: '+5511999999999',
    description: 'Telefone do usuário -> Formato E.164 (ex: +5511999999999)',
  })
  phone?: string;

  @ApiProperty({
    example: 'usuario@email.com',
    description: 'E-mail do usuário',
  })
  email: string;

  @ApiProperty({ example: 'Nome do Usuário', description: 'Nome do usuário' })
  name: string;

  @ApiProperty({
    example: 'CLIENT',
    enum: Role,
    description: 'Papel do usuário',
  })
  role: Role;

  @ApiProperty({
    example: 'ONLINE',
    enum: ChatStatus,
    description: 'Status do chat do usuário',
  })
  chatStatus: ChatStatus;

  @ApiPropertyOptional({
    example: '2026-03-28T12:34:56.000Z',
    description:
      'Última vez que o usuário foi visto -> Formato ISO 8601 (ex: 2026-03-28T12:34:56.000Z)',
  })
  lastSeen?: Date;

  @ApiProperty({ example: true, description: 'Usuário está ativo?' })
  isActive: boolean;

  @ApiPropertyOptional({
    example: '2026-03-28T12:34:56.000Z',
    description:
      'Último login do usuário -> Formato ISO 8601 (ex: 2026-03-28T12:34:56.000Z)',
  })
  lastLogin?: Date;
}
