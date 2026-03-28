import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseUserDto {
  @ApiPropertyOptional({
    example: '+5511999999999',
    description: 'Telefone do usuário -> Formato E.164 (ex: +5511999999999)',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiProperty({
    example: 'usuario@email.com',
    description: 'E-mail do usuário',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    description:
      'Senha do usuário (mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial)',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8)
  @MaxLength(100)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password: string;

  @ApiProperty({
    example: 'Nome do Usuário',
    description: 'Nome do usuário',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
