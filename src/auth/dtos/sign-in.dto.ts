import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email do usuário',
    required: true,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário',
    required: true,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(100)
  password: string;
}
