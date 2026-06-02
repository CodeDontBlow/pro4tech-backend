import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAgentStandardMessageDto {
  @ApiProperty({
    description: 'Nome curto para identificar a mensagem padrao',
    example: 'Bom dia',
    minLength: 3,
    maxLength: 80,
  })
  @IsNotEmpty({ message: 'Titulo e obrigatorio' })
  @IsString({ message: 'Titulo deve ser uma string' })
  @MinLength(3, { message: 'Titulo deve ter ao menos 3 caracteres' })
  @MaxLength(80, { message: 'Titulo deve ter no maximo 80 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Comando usado no chat para acionar a mensagem',
    example: '/bom_dia',
    minLength: 2,
    maxLength: 40,
  })
  @IsNotEmpty({ message: 'Trigger e obrigatorio' })
  @IsString({ message: 'Trigger deve ser uma string' })
  @MinLength(2, { message: 'Trigger deve ter ao menos 2 caracteres' })
  @MaxLength(40, { message: 'Trigger deve ter no maximo 40 caracteres' })
  @Matches(/^\/?[a-zA-Z0-9_]+$/, {
    message: 'Trigger deve conter apenas letras, numeros e underline',
  })
  trigger: string;

  @ApiProperty({
    description: 'Conteudo que sera enviado quando o trigger for acionado',
    example: 'Bom dia! Como posso ajudar?',
    minLength: 1,
    maxLength: 2000,
  })
  @IsNotEmpty({ message: 'Conteudo e obrigatorio' })
  @IsString({ message: 'Conteudo deve ser uma string' })
  @MinLength(1, { message: 'Conteudo deve ter ao menos 1 caractere' })
  @MaxLength(2000, { message: 'Conteudo deve ter no maximo 2000 caracteres' })
  content: string;
}
