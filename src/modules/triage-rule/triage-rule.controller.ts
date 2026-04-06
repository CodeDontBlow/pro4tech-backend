import {
  Controller,
  Get,
  Post,
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
import {
  SyncTriageRuleNodeDto,
  SyncTriageRuleResponseDto,
} from './dtos/sync-triage-rule.dto';
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

  @Post('sync')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sincronizar diagrama completo de triagem',
    description:
      'Recebe o diagrama completo de triagem (root + árvore de children) e aplica criação, atualização e remoção em uma transação única.',
  })
  @ApiBody({
    type: SyncTriageRuleNodeDto,
    description: 'Root do diagrama completo para sincronização',
    examples: {
      root: {
        summary: 'Payload do diagrama (targetGroupId)',
        value: {
          id: 'front-root-id',
          parentId: null,
          question: 'Qual é o seu problema?',
          isLeaf: false,
          answerTrigger: null,
          targetGroupId: null,
          subjectId: null,
          children: [
            {
              id: 'front-leaf-id',
              parentId: 'front-root-id',
              question: null,
              answerTrigger: 'faturamento',
              isLeaf: true,
              targetGroupId: 'group-id',
              subjectId: 'subject-id',
              children: [],
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sincronização concluída com sucesso',
    type: SyncTriageRuleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação do diagrama',
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário sem permissão para sincronizar regras de triagem',
  })
  sync(@Body() dto: SyncTriageRuleNodeDto) {
    return this.service.syncDiagram(dto);
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
    description: 'Próximo nó da árvore - pode ser um nó intermediário (com filhos) ou uma folha (com subject e targetGroupId)',
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
