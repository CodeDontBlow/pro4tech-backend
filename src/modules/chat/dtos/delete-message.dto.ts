import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsMongoId } from 'class-validator';

export class DeleteMessageDto {
  @ApiProperty({
    example: '01963f4a-5c2f-7d11-8ed0-76b8d17b9f6e',
    description: 'ID do ticket da sala de chat',
  })
  @IsUUID(undefined, { message: 'ticketId deve ser um UUID valido' })
  @IsNotEmpty({ message: 'ticketId e obrigatorio' })
  ticketId: string;

  @ApiProperty({
    example: '65f0d27a4a3c9a0e9d7f2c31',
    description: 'ID da mensagem no MongoDB',
  })
  @IsMongoId({ message: 'messageId deve ser um ObjectId valido' })
  @IsNotEmpty({ message: 'messageId e obrigatorio' })
  messageId: string;
}
