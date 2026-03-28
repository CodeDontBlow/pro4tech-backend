import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    example: '12345678000199',
    description: 'CNPJ da empresa (14 dígitos, apenas números)',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'CNPJ is required' })
  @Matches(/^\d{14}$/, { message: 'CNPJ must be exactly 14 digits' })
  cnpj: string;

  @ApiProperty({
    example: 'Empresa Exemplo Ltda',
    description: 'Nome da empresa',
    required: true,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Nome do Contato',
    description: 'Nome do contato principal da empresa',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string;

  @ApiPropertyOptional({
    example: 'contato@empresa.com',
    description: 'E-mail de contato da empresa',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid contact email format' })
  contactEmail?: string;
}
