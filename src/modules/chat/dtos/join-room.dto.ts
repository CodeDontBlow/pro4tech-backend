import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty({
    example: '01963f4a-5c2f-7d11-8ed0-76b8d17b9f6e',
    description: 'ID do ticket para entrar na sala de chat',
  })
  @IsUUID(undefined, { message: 'ticketId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ticketId é obrigatório' })
  ticketId: string;
}
