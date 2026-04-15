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
    example: 'd6481f48-1f3e-4fd3-8ad0-68066ccbd413',
    description: 'ID do cliente que está abrindo o ticket (UUID)',
    required: true,
  })
  @IsUUID(undefined, { message: 'ID do cliente deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do cliente é obrigatório' })
  clientId: string;

  @ApiProperty({
    example: 'f3c86ae4-7dbf-4f11-bf0a-5cc00ea259ec',
    description: 'ID do grupo de suporte selecionado após triagem (UUID)',
    required: true,
  })
  @IsNotEmpty({ message: 'ID do grupo de suporte é obrigatório' })
  @IsUUID(undefined, { message: 'ID do grupo de suporte deve ser um UUID válido' })
  supportGroupId: string;

  @ApiProperty({
    example: '4f2f77ce-dddd-47e5-93ea-81c1f0fa542f',
    description: 'ID do assunto do ticket selecionado após triagem (UUID)',
    required: true,
  })
  @IsNotEmpty({ message: 'ID do assunto é obrigatório' })
  @IsUUID(undefined, { message: 'ID do assunto deve ser um UUID válido' })
  subjectId: string;

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
