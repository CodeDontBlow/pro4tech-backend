import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketSubjectDto {
  @ApiProperty({
    description: 'Nome do assunto do tíquete',
    example: 'Erro na Nota Fiscal',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada do assunto',
    example: 'Problemas relacionados à geração ou validação de notas fiscais',
    minLength: 3,
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString({ message: 'Descrição deve ser uma string' })
  description: string;
}
