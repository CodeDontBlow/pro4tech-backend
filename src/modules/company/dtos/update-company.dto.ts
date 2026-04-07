import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiPropertyOptional({
    example: 'Empresa Atualizada Ltda',
    description: 'Nome atualizado da empresa',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'Nome do Contato Atualizado',
    description: 'Nome do contato principal atualizado',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string;

  @ApiPropertyOptional({
    example: 'novo-contato@empresa.com',
    description: 'E-mail de contato atualizado',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid contact email format' })
  contactEmail?: string;
}
