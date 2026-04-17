import {
  IsEnum,
  IsUUID,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority } from '../../../../generated/prisma/enums';

export class CreateTicketDto {
  @ApiProperty({
    example: '',
    description: 'ID do nó folha da triagem (UUID)',
    required: true,
  })
  @IsUUID(undefined, {
    message: 'ID do nó folha da triagem deve ser um UUID válido',
  })
  @IsNotEmpty({ message: 'ID do nó folha da triagem é obrigatório' })
  triageLeafId: string;

  @ApiProperty({
    example: 'HIGH',
    enum: TicketPriority,
    description: 'Nível de prioridade - opcional, padrão null',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(TicketPriority, {
    message: 'Prioridade deve ser LOW, MEDIUM, HIGH ou HIGHEST',
  })
  priority?: TicketPriority;
}
