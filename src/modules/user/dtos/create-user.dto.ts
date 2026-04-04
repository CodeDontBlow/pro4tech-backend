import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { BaseUserDto } from './base-user.dto';
import { Role } from 'generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto extends BaseUserDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'ID da empresa (UUID)',
    required: true,
  })
  @IsUUID(undefined, { message: 'Company ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Company ID is required' })
  companyId: string;

  @ApiProperty({
    example: 'CLIENT',
    description: 'Papel do usuário (CLIENT, AGENT ou ADMIN)',
    required: false,
    enum: Role,
  })
  @IsEnum(Role, { message: 'Role must be CLIENT, AGENT, or ADMIN' })
  role?: Role;
}
