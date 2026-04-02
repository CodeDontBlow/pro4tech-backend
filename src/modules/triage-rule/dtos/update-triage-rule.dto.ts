import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTriageRuleDto {
  @ApiPropertyOptional({
    description: 'Pergunta para esta regra',
    example: 'É sobre faturamento?',
    minLength: 3,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({
    description: 'Resposta/trigger que dispara esta regra',
    example: 'sim',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  answerTrigger?: string;

  @ApiPropertyOptional({
    description: 'Se esta regra é uma folha (final, sem filhos)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isLeaf?: boolean;

  @ApiPropertyOptional({
    description: 'ID do grupo de suporte destinatário',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsString()
  targetGroupId?: string;

  @ApiPropertyOptional({
    description: 'ID do assunto do ticket associado',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsOptional()
  @IsString()
  subjectId?: string;
}
