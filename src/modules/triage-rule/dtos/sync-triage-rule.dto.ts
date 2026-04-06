import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SyncTriageRuleNodeDto {
  @ApiProperty({
    description: 'ID do nó no frontend (pode ser temporário para nós novos)',
    example: 'temp-node-1',
  })
  @IsString()
  id: string;

  @ApiPropertyOptional({
    description: 'ID do nó pai (null para root)',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({
    description: 'Pergunta exibida no nó não-folha',
    example: 'Qual é o seu problema?',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  question?: string | null;

  @ApiPropertyOptional({
    description: 'Resposta disparadora (obrigatória para nós folha)',
    example: 'faturamento',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  answerTrigger?: string | null;

  @ApiProperty({
    description: 'Indica se o nó é folha',
    example: false,
  })
  @IsBoolean()
  isLeaf: boolean;

  @ApiPropertyOptional({
    description: 'ID do grupo de suporte do nó folha',
    example: '019d5e25-9bd8-7880-8e58-cdc779098797',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  targetGroupId?: string | null;

  @ApiPropertyOptional({
    description: 'ID do assunto do nó folha',
    example: '019d5e25-9bea-7880-8e58-f4a0d4883738',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  subjectId?: string | null;

  @ApiProperty({
    description: 'Lista de nós filhos',
    type: () => SyncTriageRuleNodeDto,
    isArray: true,
    example: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncTriageRuleNodeDto)
  children: SyncTriageRuleNodeDto[] = [];
}

export class SyncTriageRuleResponseDto {
  @ApiProperty({
    description: 'Quantidade de nós criados',
    example: 3,
  })
  nodesCreated: number;

  @ApiProperty({
    description: 'Quantidade de nós atualizados',
    example: 5,
  })
  nodesUpdated: number;

  @ApiProperty({
    description: 'Quantidade de nós removidos',
    example: 2,
  })
  nodesDeleted: number;

  @ApiProperty({
    description: 'Mapeamento de IDs recebidos para IDs persistidos (somente nós criados)',
    example: {
      'temp-node-1': '019d62dc-bf40-7a57-99f3-8f0936f9d3e1',
      'temp-node-2': '019d62dc-bf45-7a57-99f3-9a1a54ac8fd2',
    },
    additionalProperties: {
      type: 'string',
    },
  })
  idMapping: Record<string, string>;
}
