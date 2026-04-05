import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Role, ChatStatus } from 'generated/prisma/client';
import { BaseUserDto } from './base-user.dto';

export class ResponseUserDto extends PickType(BaseUserDto, [
  'name',
  'email',
  'phone',
] as const) {
  @ApiProperty({ example: 'uuid-v4', description: 'ID do usuário' })
  id: string;

  @ApiProperty({ example: 'uuid-v4', description: 'ID da empresa' })
  companyId: string;

  @ApiProperty({ enum: Role, example: Role.CLIENT })
  role: Role;

  @ApiProperty({ enum: ChatStatus, example: ChatStatus.ONLINE })
  chatStatus: ChatStatus;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: '2026-03-28T12:34:56.000Z' })
  lastSeen?: Date;

  @ApiPropertyOptional({ example: '2026-03-28T12:34:56.000Z' })
  lastLogin?: Date;
}
