import {
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  TicketStatus,
  TicketPriority,
} from '../../../../generated/prisma/enums';

export class UpdateTicketDto {
  @ApiProperty({
    example: 'OPENED',
    enum: ['TRIAGE', 'OPENED', 'ESCALATED', 'CLOSED', 'RESOLVED'],
    description: 'Novo status do ticket',
    required: false,
  })
  @IsOptional()
  @IsEnum(TicketStatus, {
    message: 'Status deve ser TRIAGE, OPENED, ESCALATED, CLOSED ou RESOLVED',
  })
  status?: TicketStatus;

  @ApiProperty({
    example: 'HIGH',
    enum: TicketPriority,
    description: 'Nível de prioridade',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(TicketPriority, {
    message: 'Prioridade deve ser LOW, MEDIUM, HIGH ou HIGHEST',
  })
  priority?: TicketPriority;

  @ApiProperty({
    example: 5,
    description: 'Nota de avaliação (0-5)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'Nota de avaliação deve ser um número inteiro' })
  @Min(0, { message: 'Nota de avaliação deve ser no mínimo 0' })
  @Max(5, { message: 'Nota de avaliação deve ser no máximo 5' })
  ratingScore?: number;

  @ApiProperty({
    example: 'Great support!',
    description: 'Comentário de avaliação do cliente',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Comentário de avaliação deve ser uma string válida' })
  ratingComment?: string;
}
