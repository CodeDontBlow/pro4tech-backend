import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SupportLevel } from 'generated/prisma/client';

export class BaseAgentDto {
  @ApiPropertyOptional({
    example: 'LEVEL_1',
    description: 'Nível de suporte do agent (LEVEL_1, LEVEL_2, LEVEL_3)',
    enum: SupportLevel,
  })
  @IsOptional()
  @IsEnum(SupportLevel, {
    message: 'SupportLevel must be LEVEL_1, LEVEL_2, or LEVEL_3',
  })
  supportLevel?: SupportLevel;

  @ApiPropertyOptional({
    example: true,
    description: 'Se o agent pode responder tickets',
  })
  @IsOptional()
  @IsBoolean({ message: 'canAnswer must be a boolean' })
  canAnswer?: boolean;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do grupo de suporte',
  })
  @IsOptional()
  @IsString({ message: 'O ID do grupo deve ser uma string' })
  supportGroupId?: string;
}
