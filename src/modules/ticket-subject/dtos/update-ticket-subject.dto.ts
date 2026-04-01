import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketSubjectDto {
  @ApiProperty({
    description: 'Nome do assunto do tíquete (opcional)',
    example: 'Erro na Nota Fiscal - Atualizado',
    minLength: 3,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descrição do assunto (opcional)',
    example: 'Problemas relacionados à geração, validação e emissão de notas fiscais',
    minLength: 3,
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Se o assunto está ativo ou não (opcional)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
