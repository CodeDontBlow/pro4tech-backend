import { IsString, IsOptional, IsBoolean, IsNotEmpty, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTriageRuleDto {
  @ApiPropertyOptional({
    description: 'ID da regra pai (para criar sub-galhos)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Pergunta para esta regra (obrigatória se isLeaf é false)',
    example: 'Qual é o seu problema?',
    minLength: 3,
    maxLength: 255,
  })
  @ValidateIf((o) => !o.isLeaf)
  @IsNotEmpty({ message: 'Pergunta é obrigatória quando isLeaf é false' })
  @IsString()
  question?: string;

  @ApiPropertyOptional({
    description: 'Resposta/trigger que dispara esta regra (ex: "sim", "erro-nota")',
    example: 'Faturamento',
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
  isLeaf?: boolean = false;

  @ApiPropertyOptional({
    description: 'ID do grupo de suporte destinatário (se isLeaf é true)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsString()
  targetGroupId?: string;

  @ApiPropertyOptional({
    description: 'ID do assunto do ticket associado (se isLeaf é true)',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsOptional()
  @IsString()
  subjectId?: string;
}
