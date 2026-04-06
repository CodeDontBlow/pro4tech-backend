import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  TicketStatus,
  TicketPriority,
} from '../../../../generated/prisma/enums';

export class UpdateTicketDto {
  @ApiProperty({
    example: 'OPENED',
    enum: ['TRIAGE', 'OPENED', 'ESCALATED', 'CLOSED', 'RESOLVED'],
    description: 'New status for the ticket',
    required: false,
  })
  @IsOptional()
  @IsEnum(TicketStatus, {
    message: 'Status must be TRIAGE, OPENED, ESCALATED, CLOSED, or RESOLVED',
  })
  status?: TicketStatus;

  @ApiProperty({
    example: 'HIGH',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'HIGHEST'],
    description: 'Priority level',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'HIGHEST'], {
    message: 'Priority must be LOW, MEDIUM, HIGH, or HIGHEST',
  })
  priority?: TicketPriority;

  @ApiProperty({
    example: 5,
    description: 'Rating score (0-5)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Rating score must be at least 0' })
  @Max(5, { message: 'Rating score must not exceed 5' })
  ratingScore?: number;

  @ApiProperty({
    example: 'Great support!',
    description: 'Rating comment from client',
    required: false,
    nullable: true,
  })
  @IsOptional()
  ratingComment?: string;
}
