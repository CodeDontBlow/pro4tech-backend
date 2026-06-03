import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateAgentStandardMessageDto {
  @ApiPropertyOptional({
    description: 'Nome curto para identificar a mensagem padrao',
    example: 'Bom dia',
    minLength: 3,
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  title?: string;

  @ApiPropertyOptional({
    description: 'Comando usado no chat para acionar a mensagem',
    example: '/bom_dia',
    minLength: 2,
    maxLength: 40,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @Matches(/^\/?[a-zA-Z0-9_]+$/, {
    message: 'Trigger deve conter apenas letras, numeros e underline',
  })
  trigger?: string;

  @ApiPropertyOptional({
    description: 'Conteudo que sera enviado quando o trigger for acionado',
    example: 'Bom dia! Como posso ajudar?',
    minLength: 1,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content?: string;
}
