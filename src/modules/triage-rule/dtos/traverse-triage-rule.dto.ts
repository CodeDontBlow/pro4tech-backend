import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TraverseTriageRuleDto {
  @ApiProperty({
    description: 'O gatilho de resposta para navegar na árvore',
    example: 'faturamento',
  })
  @IsNotEmpty()
  @IsString()
  answerTrigger: string;
}

export class ChildNodeDto {
  @ApiProperty({
    description: 'ID único do nó filho',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'O gatilho de resposta para este nó filho',
    example: 'suporte',
  })
  answerTrigger: string;
}

export class SubjectDto {
  @ApiProperty({
    description: 'ID único do assunto',
    example: '550e8400-e29b-41d4-a716-446655440050',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do assunto do ticket',
    example: 'Suporte Técnico',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada do assunto',
    example: 'Problemas técnicos gerais com a plataforma',
  })
  description: string;

  @ApiProperty({
    description: 'Se o assunto está ativo',
    example: true,
  })
  isActive: boolean;
}

export class SupportGroupTraverseDto {
  @ApiProperty({
    description: 'ID unico do grupo de suporte',
    example: '550e8400-e29b-41d4-a716-446655440100',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do grupo de suporte',
    example: 'Suporte Nível 1',
  })
  name: string;

  @ApiProperty({
    description: 'Descricao do grupo de suporte',
    example: 'Equipe de atendimento inicial',
  })
  description: string;
}

export class TraverseResponseDto {
  @ApiProperty({
    description: 'ID único do nó',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Pergunta a ser exibida (presente em nós não-folha)',
    example: 'Qual é seu problema?',
  })
  question?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'O gatilho de resposta deste nó',
    example: 'faturamento',
  })
  answerTrigger?: string;

  @ApiProperty({
    description: 'Se este é um nó folha (sem filhos)',
    example: false,
  })
  isLeaf: boolean;

  @ApiProperty({
    required: false,
    type: [ChildNodeDto],
    description: 'Filhos disponíveis (presente em nós não-folha)',
  })
  children?: ChildNodeDto[];

  @ApiProperty({
    required: false,
    type: SubjectDto,
    description: 'Assunto do ticket associado (presente em folhas)',
  })
  subject?: SubjectDto;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'ID do grupo de suporte responsável (presente em folhas)',
    example: '550e8400-e29b-41d4-a716-446655440100',
  })
  targetGroupId?: string;

  @ApiProperty({
    required: false,
    type: SupportGroupTraverseDto,
    description: 'Grupo de suporte associado ao nó (presente em folhas)',
  })
  supportGroup?: SupportGroupTraverseDto;
}
