import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority } from '../../../../generated/prisma/enums';

export class CreateTicketDto {
  @ApiProperty({
    example: 'company-123',
    description: 'Company ID (UUID)',
    required: true,
  })
  @IsUUID(undefined, { message: 'Company ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Company ID is required' })
  companyId: string;

  @ApiProperty({
    example: 'user-456',
    description: 'Client ID who is opening the ticket (UUID)',
    required: true,
  })
  @IsUUID(undefined, { message: 'Client ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Client ID is required' })
  clientId: string;

  @ApiProperty({
    example: 'group-789',
    description: 'Support Group ID (UUID) - optional',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'Support Group ID must be a valid UUID' })
  supportGroupId?: string;

  @ApiProperty({
    example: 'subject-111',
    description: 'Ticket Subject ID (UUID) - optional',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'Subject ID must be a valid UUID' })
  subjectId?: string;

  @ApiProperty({
    example: 'HIGH',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'HIGHEST'],
    description: 'Priority level - optional, default to null',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'HIGHEST'], {
    message: 'Priority must be LOW, MEDIUM, HIGH, or HIGHEST',
  })
  priority?: TicketPriority;
}
