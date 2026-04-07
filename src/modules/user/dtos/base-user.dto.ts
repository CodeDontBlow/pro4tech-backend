// base-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, ChatStatus } from 'generated/prisma/client';

export class BaseUserDto {
  @ApiProperty({ example: 'Nome do Usuário' })
  @IsString({ message: 'O nome deve ser uma sequência de caracteres' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'O e-mail informado é inválido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  @MaxLength(255, { message: 'O e-mail deve ter no máximo 255 caracteres' })
  email: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsString({ message: 'A senha deve ser uma sequência de caracteres' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
    message:
      'A senha deve conter ao menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
  })
  password: string;

  @ApiPropertyOptional({ example: '+5511999999999' })
  @IsOptional()
  @IsPhoneNumber('BR', {
    message:
      'O número de telefone deve estar no formato internacional válido (ex: +55...)',
  })
  phone?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role, { message: 'O nível de acesso selecionado é inválido' })
  role?: Role;

  @ApiPropertyOptional({ enum: ChatStatus })
  @IsOptional()
  @IsEnum(ChatStatus, { message: 'O status do chat selecionado é inválido' })
  chatStatus?: ChatStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso' })
  isActive?: boolean;
}
