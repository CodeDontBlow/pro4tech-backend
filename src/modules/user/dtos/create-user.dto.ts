import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
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
}

export class CreateUserDto extends IntersectionType(
  BaseUserDto,
  AdditionalCreateFields,
) {}
