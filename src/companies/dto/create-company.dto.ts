/*
 * DTO para criação de empresas parceiras (PT-79).
 */
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsEmail()
  email: string;
}