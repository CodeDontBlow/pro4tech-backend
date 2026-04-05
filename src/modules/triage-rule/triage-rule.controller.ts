import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TriageRuleService } from './triage-rule.service';
import { CreateTriageRuleDto } from './dtos/create-triage-rule.dto';
import { UpdateTriageRuleDto } from './dtos/update-triage-rule.dto';
import { TraverseTriageRuleDto } from './dtos/traverse-triage-rule.dto';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';
import { Role } from 'generated/prisma/client';

@ApiTags('Triage Rules')
@ApiBearerAuth('bearer')
@Controller('triage-rules')
export class TriageRuleController {
  constructor(private readonly service: TriageRuleService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Listar todas as regras de triagem',
    description: 'Retorna um lista hierárquica de todas as regras de triagem. Requer autenticação ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de regras de triagem obtida com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get('root')
  @Public()
  @ApiOperation({ summary: 'Obter a pergunta inicial da triagem (Dinâmico)' })
  findRoot() {
    return this.service.findRoot();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiParam({
    name: 'id',
    description: 'ID da regra de triagem',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOperation({
    summary: 'Obter regra de triagem por ID',
    description: 'Retorna uma regra de triagem específica com seus filhos. Requer autenticação ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Regra de triagem obtida com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Regra de triagem não encontrada',
  })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Criar nova regra de triagem',
    description: 'Cria uma nova regra de triagem (raiz, intermediária ou folha). Requer autenticação ADMIN.',
  })
  @ApiBody({
    type: CreateTriageRuleDto,
    description: 'Dados para criar a regra de triagem',
    examples: {
      root: {
        value: {
          question: 'Qual é o seu problema?',
          isLeaf: false,
        },
      },
      intermediate: {
        value: {
          parentId: 'parent-id',
          question: 'É sobre faturamento?',
          answerTrigger: 'sim',
          isLeaf: false,
        },
      },
      leaf: {
        value: {
          parentId: 'parent-id',
          answerTrigger: 'erro-na-nota',
          isLeaf: true,
          subjectId: 'subject-id',
          targetGroupId: 'group-id',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Regra de triagem criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação (ex: pergunta obrigatória para não-folha)',
  })
  create(@Body() dto: CreateTriageRuleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiParam({
    name: 'id',
    description: 'ID da regra de triagem a atualizar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOperation({
    summary: 'Atualizar regra de triagem',
    description: 'Atualiza campos de uma regra de triagem existente. Requer autenticação ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Regra de triagem atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Regra de triagem não encontrada',
  })
  update(@Param('id') id: string, @Body() dto: UpdateTriageRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    description: 'ID da regra de triagem a deletar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOperation({
    summary: 'Deletar regra de triagem',
    description: 'Deleta uma regra de triagem. Requer autenticação ADMIN.',
  })
  @ApiResponse({
    status: 204,
    description: 'Regra de triagem deletada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Regra de triagem não encontrada',
  })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post('traverse')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Navegar árvore de triagem (desde a raiz)',
    description: 'Encontra o próximo nó na árvore baseado na resposta fornecida. Começa pela raiz. Não requer autenticação.',
  })
  @ApiBody({
    type: TraverseTriageRuleDto,
    examples: {
      faturamento: {
        summary: 'Navegar para branch de faturamento',
        value: {
          answerTrigger: 'faturamento',
        },
      },
      suporte: {
        summary: 'Navegar para branch de suporte técnico',
        value: {
          answerTrigger: 'suporte',
        },
      },
      admin: {
        summary: 'Navegar para branch administrativo',
        value: {
          answerTrigger: 'admin',
        },
      },
      compliance: {
        summary: 'Navegar para branch de compliance',
        value: {
          answerTrigger: 'compliance',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Próximo nó da árvore - pode ser um nó intermediário (com filhos) ou uma folha (com subject e targetGroup)',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        question: 'Qual é seu problema de faturamento?',
        answerTrigger: 'faturamento',
        isLeaf: false,
        children: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            answerTrigger: 'faturas',
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            answerTrigger: 'pagamento',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Nenhuma raiz disponível ou resposta não encontrada',
    schema: {
      example: {
        statusCode: 400,
        message: 'Resposta não encontrada na raiz da árvore',
        error: 'Bad Request',
      },
    },
  })
  traverse(@Body() dto: TraverseTriageRuleDto) {
    return this.service.traverse(dto.answerTrigger);
  }

  @Post(':id/traverse')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    description: 'ID do nó pai para começar a navegação',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOperation({
    summary: 'Navegar árvore de triagem (desde nó específico)',
    description: 'Encontra o próximo nó na árvore baseado na resposta fornecida, começando a partir de um nó pai específico. Não requer autenticação.',
  })
  @ApiBody({
    type: TraverseTriageRuleDto,
    examples: {
      folha_suporte1: {
        summary: 'Selecionar primeiro tipo de suporte',
        value: {
          answerTrigger: 'email',
        },
      },
      folha_suporte2: {
        summary: 'Selecionar segundo tipo de suporte',
        value: {
          answerTrigger: 'chat',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Próximo nó da árvore - geralmente uma folha (leaf) com subject de ticket e grupo de suporte',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440005',
        answerTrigger: 'email',
        isLeaf: true,
        subject: {
          id: '550e8400-e29b-41d4-a716-446655440050',
          name: 'Suporte por Email',
          description: 'Contato via email',
          isActive: true,
        },
        targetGroupId: '550e8400-e29b-41d4-a716-446655440100',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Resposta não encontrada sob este nó pai',
    schema: {
      example: {
        statusCode: 400,
        message: 'Resposta não encontrada sob este nó pai',
        error: 'Bad Request',
      },
    },
  })
  traverseFrom(@Param('id') id: string, @Body() dto: TraverseTriageRuleDto) {
    return this.service.traverse(dto.answerTrigger, id);
  }
}
