import {
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupportLevel } from '../../../../generated/prisma/enums';

export class EscalateTicketDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do novo grupo de suporte',
    required: false,
  })
  @IsOptional()
  @IsUUID('all', { message: 'ID do grupo deve ser um UUID válido' })
  targetGroupId?: string;

  @ApiProperty({
    example: 'LEVEL_2',
    enum: SupportLevel,
    description: 'Novo nível de suporte',
    required: false,
  })
  @IsOptional()
  @IsEnum(SupportLevel, { 
    message: 'Nível de suporte deve ser LEVEL_1, LEVEL_2 ou LEVEL_3' 
  })
  targetSupportLevel?: SupportLevel;

  @ApiProperty({
    example: 'Escalando para N2 devido à complexidade técnica.',
    description: 'Motivo do escalonamento',
    required: true,
  })
  @IsString({ message: 'O comentário deve ser uma string válida' })
  comment: string;
}