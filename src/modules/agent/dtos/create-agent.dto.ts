import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupportLevel } from 'generated/prisma/client';
import { BaseAgentDto } from './base-agent.dto';

/**
 * DTO para criação de Agent
 * Usado internamente quando um User com role AGENT é criado
 */
export class CreateAgentDto extends BaseAgentDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'ID do usuário (mesmo ID do Agent)',
    required: true,
  })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    example: 'LEVEL_1',
    description: 'Nível de suporte inicial (LEVEL_1, LEVEL_2, LEVEL_3)',
    enum: SupportLevel,
    required: true,
  })
  @IsEnum(SupportLevel, {
    message: 'SupportLevel must be LEVEL_1, LEVEL_2, or LEVEL_3',
  })
  @IsNotEmpty({ message: 'SupportLevel is required' })
  supportLevel: SupportLevel;

  @ApiProperty({
    example: true,
    description: 'Se o agent pode responder tickets inicialmente',
    required: true,
  })
  @IsNotEmpty({ message: 'canAnswer is required' })
  canAnswer: boolean;
}
