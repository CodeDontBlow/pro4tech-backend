import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';

import { ChatStatus } from 'generated/prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Nome do Usuário',
    description: 'Nome atualizado do usuário',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: '+5511999999999',
    description:
      'Telefone atualizado do usuário -> Formato E.164 (ex: +5511999999999)',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'ONLINE',
    description: 'Status do chat do usuário',
    enum: ChatStatus,
  })
  @IsOptional()
  @IsEnum(ChatStatus)
  chatStatus?: ChatStatus;

  @ApiPropertyOptional({ example: true, description: 'Usuário está ativo?' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
