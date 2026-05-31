import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SupportLevel } from 'generated/prisma/client';
import { BaseUserDto } from './base-user.dto';

export class AdditionalCreateFields {
  @ApiPropertyOptional({
    description:
      'ID da empresa (Obrigatório para Clientes, automático para Atendentes)',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  @IsUUID('7', { message: 'O ID da empresa deve ser um código UUID válido' })
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({
    example: 'LEVEL_1',
    description: 'Nível de suporte quando o usuário for um agente',
    enum: SupportLevel,
  })
  @IsEnum(SupportLevel, {
    message: 'O Nível de Suporte deve ser um dos seguintes valores: LEVEL_1, LEVEL_2, or LEVEL_3',
  })
  @IsOptional()
  supportLevel?: SupportLevel;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do grupo de suporte para atribuição inicial do agente',
  })
  @IsUUID('7', { message: 'O ID do grupo deve ser um código UUID válido' })
  @IsOptional()
  supportGroupId?: string;
}

export class CreateUserDto extends IntersectionType(
  BaseUserDto,
  AdditionalCreateFields,
) {}
