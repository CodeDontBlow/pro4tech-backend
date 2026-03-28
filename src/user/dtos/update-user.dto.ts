import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ChatStatus } from 'generated/prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phone?: string;

  @IsOptional()
  @IsEnum(ChatStatus)
  chatStatus?: ChatStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
