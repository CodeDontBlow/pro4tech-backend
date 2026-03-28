import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty({ message: 'CNPJ is required' })
  @Matches(/^\d{14}$/, { message: 'CNPJ must be exactly 14 digits' })   
  cnpj: string;

  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid contact email format' })
  contactEmail?: string;
}
