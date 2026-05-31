import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUrl } from 'class-validator';

export class ChatAttachmentDto {
  @ApiProperty({
    example: 'https://files.local/pro4tech/chat/123/file.png',
  })
  @IsUrl({}, { message: 'url deve ser valida' })
  url: string;

  @ApiProperty({ example: 'chat/123/uuid.png' })
  @IsString({ message: 'key deve ser string' })
  key: string;

  @ApiProperty({ example: 'print.png' })
  @IsString({ message: 'originalName deve ser string' })
  originalName: string;

  @ApiProperty({ example: 'image/png' })
  @IsString({ message: 'mimeType deve ser string' })
  mimeType: string;

  @ApiProperty({ example: 153212 })
  @IsNumber({}, { message: 'size deve ser numero' })
  size: number;
}
