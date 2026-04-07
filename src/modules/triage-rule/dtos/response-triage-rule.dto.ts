import { ApiProperty } from '@nestjs/swagger';

export class SupportGroupDto {
  @ApiProperty({
    description: 'ID do grupo de suporte',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do grupo de suporte',
    example: 'Suporte Fiscal',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do grupo',
    example: 'Equipe especializada em assuntos fiscais',
  })
  description: string;
}

export class TicketSubjectDto {
  @ApiProperty({
    description: 'ID do assunto',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do assunto',
    example: 'Erro na Nota Fiscal',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do assunto',
    example: 'Problemas na geração ou validação',
  })
  description: string;

  @ApiProperty({
    description: 'Se está ativo',
    example: true,
  })
  isActive: boolean;
}

export class ResponseTriageRuleDto {
  @ApiProperty({
    description: 'ID único da regra (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ID da regra pai (null para raiz)',
    example: '550e8400-e29b-41d4-a716-446655440003',
    nullable: true,
  })
  parentId?: string;

  @ApiProperty({
    description: 'Pergunta da regra (se não for folha)',
    example: 'Qual é o seu problema?',
    nullable: true,
  })
  question?: string;

  @ApiProperty({
    description: 'Resposta que dispara esta regra',
    example: 'faturamento',
    nullable: true,
  })
  answerTrigger?: string;

  @ApiProperty({
    description: 'Se é um nó folha (terminal)',
    example: false,
  })
  isLeaf: boolean;

  @ApiProperty({
    description: 'ID do grupo de suporte (se for folha)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  targetGroupId?: string;

  @ApiProperty({
    description: 'ID do assunto do ticket (se for folha)',
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  subjectId?: string;

  @ApiProperty({
    description: 'Nós filhos (hierarquia)',
    type: () => ResponseTriageRuleDto,
    isArray: true,
    example: [],
  })
  children?: ResponseTriageRuleDto[];

  @ApiProperty({
    description: 'Dados do assunto associado',
    type: TicketSubjectDto,
    nullable: true,
  })
  subject?: TicketSubjectDto;

  @ApiProperty({
    description: 'Dados do grupo de suporte associado',
    type: SupportGroupDto,
    nullable: true,
  })
  supportGroup?: SupportGroupDto;
}
