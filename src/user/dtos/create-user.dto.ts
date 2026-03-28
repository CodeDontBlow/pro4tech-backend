import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { BaseUserDto } from './base-user.dto';
import { Role } from 'generated/prisma/client';

export class CreateUserDto extends BaseUserDto {
  @IsUUID(4, { message: 'Company ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Company ID is required' })
  companyId: string;

  @IsEnum(Role, { message: 'Role must be CLIENT, AGENT, or ADMIN' })
  role?: Role;
}
