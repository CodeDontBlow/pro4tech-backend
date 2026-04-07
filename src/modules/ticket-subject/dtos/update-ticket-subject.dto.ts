import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTicketSubjectDto {
  @ApiPropertyOptional({
    description: 'Nome do assunto do tíquete',
    example: 'Erro na Nota Fiscal - Atualizado',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Descrição do assunto',
    example:
      'Problemas relacionados à geração, validação e emissão de notas fiscais',
    minLength: 3,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Se o assunto está ativo ou inativo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
