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
import { Role } from '@prisma/enums';

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

  @Get('react-flow')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obter árvore de triagem em formato React Flow',
    description: 'Retorna a árvore hierárquica em formato flat (nodes + edges) otimizado para React Flow. Ideal para frontend renderizar com react-flow-renderer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estrutura React Flow com nodes e edges',
    schema: {
      example: {
        nodes: [
          {
            id: 'node-1',
            data: {
              id: 'node-1',
              label: 'Qual é o seu problema?',
              question: 'Qual é o seu problema?',
              nodeType: 'root',
              childrenCount: 2,
            },
            type: 'default',
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            label: 'Faturamento',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido',
  })
  findAllReactFlow() {
    return this.service.findAllReactFlow();
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
  @ApiResponse({
    status: 200,
    description: 'Próximo nó da árvore',
  })
  @ApiResponse({
    status: 400,
    description: 'Nenhuma raiz disponível ou resposta não encontrada',
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
  @ApiResponse({
    status: 200,
    description: 'Próximo nó da árvore',
  })
  @ApiResponse({
    status: 400,
    description: 'Resposta não encontrada sob este nó pai',
  })
  traverseFrom(@Param('id') id: string, @Body() dto: TraverseTriageRuleDto) {
    return this.service.traverse(dto.answerTrigger, id);
  }
}
