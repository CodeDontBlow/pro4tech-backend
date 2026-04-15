import {
  IsEnum,
  IsUUID,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority } from '../../../../generated/prisma/enums';

export class CreateTicketDto {
  @ApiProperty({
    example: 'd6481f48-1f3e-4fd3-8ad0-68066ccbd413',
    description: 'Client ID who is opening the ticket (UUID)',
    required: true,
  })
  @IsUUID(undefined, { message: 'Client ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Client ID is required' })
  clientId: string;

  @ApiProperty({
    example: 'f3c86ae4-7dbf-4f11-bf0a-5cc00ea259ec',
    description: 'Support Group ID selected after triage (UUID)',
    required: true,
  })
  @IsNotEmpty({ message: 'Support Group ID is required' })
  @IsUUID(undefined, { message: 'Support Group ID must be a valid UUID' })
  supportGroupId: string;

  @ApiProperty({
    example: '4f2f77ce-dddd-47e5-93ea-81c1f0fa542f',
    description: 'Ticket Subject ID selected after triage (UUID)',
    required: true,
  })
  @IsNotEmpty({ message: 'Subject ID is required' })
  @IsUUID(undefined, { message: 'Subject ID must be a valid UUID' })
  subjectId: string;

  @ApiProperty({
    example: 'HIGH',
    enum: TicketPriority,
    description: 'Priority level - optional, default to null',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(TicketPriority, {
    message: 'Priority must be LOW, MEDIUM, HIGH, or HIGHEST',
  })
  priority?: TicketPriority;
}
