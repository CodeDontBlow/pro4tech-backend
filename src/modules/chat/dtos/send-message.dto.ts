import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: '01963f4a-5c2f-7d11-8ed0-76b8d17b9f6e',
    description: 'ID do ticket da sala de chat',
  })
  @IsUUID(undefined, { message: 'ticketId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ticketId é obrigatório' })
  ticketId: string;

  @ApiProperty({
    example: 'Olá, já assumi seu chamado.',
    description: 'Conteúdo da mensagem',
  })
  @IsString({ message: 'content deve ser uma string válida' })
  @IsNotEmpty({ message: 'content é obrigatório' })
  @MaxLength(2000, { message: 'content deve ter no máximo 2000 caracteres' })
  content: string;
}
