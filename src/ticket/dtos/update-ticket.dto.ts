import { IsOptional, IsEnum, IsNumber, Min, Max, IsString } from 'class-validator';
import { TicketStatus, TicketPriority } from '../../../generated/prisma/enums';

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  ratingScore?: number;

  @IsOptional()
  @IsString()
  ratingComment?: string;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  closedAt?: TicketStatus;
}