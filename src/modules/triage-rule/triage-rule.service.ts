import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { TriageRuleRepository } from './triage-rule.repository';
import { CreateTriageRuleDto } from './dtos/create-triage-rule.dto';
import { UpdateTriageRuleDto } from './dtos/update-triage-rule.dto';
import { ResponseTriageRuleDto } from './dtos/response-triage-rule.dto';
import { TraverseResponseDto } from './dtos/traverse-triage-rule.dto';
import { ReactFlowTriageRuleDto } from './dtos/react-flow-triage-rule.dto';
import { PrismaService } from '@database/prisma/prisma.service';

@Injectable()
export class TriageRuleService {
  private readonly logger = new Logger(TriageRuleService.name);

  constructor(
    private readonly repository: TriageRuleRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateTriageRuleDto): Promise<ResponseTriageRuleDto> {
    // Validação: se não for folha, pergunta é obrigatória
    if (!data.isLeaf && !data.question) {
      throw new BadRequestException('Pergunta é obrigatória quando isLeaf é false');
    }

    // Validação: se for folha, answerTrigger deve ser fornecido
    if (data.isLeaf && !data.answerTrigger) {
      throw new BadRequestException('Resposta disparadora é obrigatória quando isLeaf é true');
    }

    // Validação: parentId deve existir se fornecido
    if (data.parentId) {
      const parentExists = await this.repository.existsWithParentId(data.parentId);
      if (!parentExists) {
        throw new BadRequestException(`Regra de triagem pai com id ${data.parentId} não encontrada`);
      }
    }

    // Validação: targetGroupId deve existir se fornecido
    if (data.targetGroupId) {
      const groupExists = await this.prisma.supportGroup.findUnique({
        where: { id: data.targetGroupId },
        select: { id: true },
      });
      if (!groupExists) {
        throw new BadRequestException(`Grupo de suporte com id ${data.targetGroupId} não encontrado`);
      }
    }

    // Validação: subjectId deve existir e ser único se fornecido
    if (data.subjectId) {
      const subjectExists = await this.prisma.ticketSubject.findUnique({
        where: { id: data.subjectId },
        select: { id: true },
      });
      if (!subjectExists) {
        throw new BadRequestException(`Assunto do tíquete com id ${data.subjectId} não encontrado`);
      }

      // Verifica se o assunto já é utilizado por outra regra de triagem
      const subjectUsed = await this.prisma.triageRule.findUnique({
        where: { subjectId: data.subjectId },
        select: { id: true },
      });
      if (subjectUsed) {
        throw new BadRequestException(`Assunto do tíquete com id ${data.subjectId} já está sendo utilizado por outra regra de triagem`);
      }
    }

    const id = uuidv7();
    return this.repository.create({
      ...data,
      // Override with generated ID in the actual call if needed
    });
  }

  async findAll(): Promise<ResponseTriageRuleDto[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<ResponseTriageRuleDto> {
    const rule = await this.repository.findById(id);
    if (!rule) {
      throw new NotFoundException(`Regra de triagem com id ${id} não encontrada`);
    }
    return rule;
  }

  async update(id: string, data: UpdateTriageRuleDto): Promise<ResponseTriageRuleDto> {
    // Verifica se existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Regra de triagem com id ${id} não encontrada`);
    }

    // Validação: se não for folha, pergunta é obrigatória (ou já foi fornecida)
    if (data.isLeaf === false && !data.question && !existing.question) {
      throw new BadRequestException('Pergunta é obrigatória quando isLeaf é false');
    }

    // Validação: targetGroupId se fornecido
    if (data.targetGroupId) {
      const groupExists = await this.prisma.supportGroup.findUnique({
        where: { id: data.targetGroupId },
        select: { id: true },
      });
      if (!groupExists) {
        throw new BadRequestException(`Grupo de suporte com id ${data.targetGroupId} não encontrado`);
      }
    }

    // Validação: subjectId se fornecido e alterado
    if (data.subjectId && data.subjectId !== existing.subjectId) {
      const subjectExists = await this.prisma.ticketSubject.findUnique({
        where: { id: data.subjectId },
        select: { id: true },
      });
      if (!subjectExists) {
        throw new BadRequestException(`Assunto do tíquete com id ${data.subjectId} não encontrado`);
      }

      // Verifica se o assunto já é utilizado por outra regra de triagem
      const subjectUsed = await this.prisma.triageRule.findUnique({
        where: { subjectId: data.subjectId },
        select: { id: true },
      });
      if (subjectUsed) {
        throw new BadRequestException(`Assunto do tíquete com id ${data.subjectId} já está sendo utilizado por outra regra de triagem`);
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Regra de triagem com id ${id} não encontrada`);
    }

    await this.repository.delete(id);
  }

  async traverse(answerTrigger: string, currentNodeId?: string): Promise<TraverseResponseDto> {
    let parentId: string | null = null;

    // Se nenhum nó atual fornecido, começar pela raiz
    if (!currentNodeId) {
      // Encontra qualquer nó raiz (parentId é null)
      const roots = await this.prisma.triageRule.findMany({
        where: { parentId: null },
        select: { id: true },
        take: 1,
      });

      if (roots.length === 0) {
        throw new BadRequestException('Nenhuma regra de triagem raiz encontrada');
      }

      parentId = roots[0].id;
    } else {
      parentId = currentNodeId;
    }

    // Encontra filho com resposta disparadora correspondente
    const nextNode = await this.repository.findByAnswerTrigger(answerTrigger, parentId);

    if (!nextNode) {
      throw new BadRequestException(
        `Nenhuma regra de triagem encontrada com a resposta disparadora "${answerTrigger}" sob o nó pai`,
      );
    }

    // Busca filhos para a resposta
    const children = await this.repository.findByParentId(nextNode.id);

    return {
      id: nextNode.id,
      question: nextNode.question,
      answerTrigger: nextNode.answerTrigger,
      isLeaf: nextNode.isLeaf,
      children: nextNode.isLeaf
        ? undefined
        : children.map((child) => ({
            id: child.id,
            answerTrigger: child.answerTrigger || '',
          })),
      subject: nextNode.subject
        ? {
            id: nextNode.subject.id,
            name: nextNode.subject.name,
            description: nextNode.subject.description,
          }
        : undefined,
      targetGroupId: nextNode.targetGroupId,
    };
  }

  private async wouldCreateCycle(childId: string, targetParentId: string): Promise<boolean> {
    if (childId === targetParentId) {
      return true;
    }

    const parent = await this.prisma.triageRule.findUnique({
      where: { id: targetParentId },
      select: { parentId: true },
    });

    if (!parent || !parent.parentId) {
      return false;
    }

    return this.wouldCreateCycle(childId, parent.parentId);
  }

  /**
   * Converte árvore de TriageRule para formato React Flow (nodes + edges)
   * Usado para frontend renderizar com react-flow-renderer
   *
   * @param rules Array de TriageRules (geralmente raízes)
   * @returns ReactFlowTriageRuleDto com nodes e edges
   */
  async toReactFlowFormat(rules: ResponseTriageRuleDto[]): Promise<ReactFlowTriageRuleDto> {
    const nodes = [];
    const edges = [];
    const processedIds = new Set<string>();

    // Auxiliar: processa recursivamente a árvore
    const flattenTree = (rule: ResponseTriageRuleDto) => {
      if (processedIds.has(rule.id)) return;
      processedIds.add(rule.id);

      // Determina tipo de nó
      let nodeType: 'root' | 'question' | 'leaf' = 'question';
      if (!rule.parentId) nodeType = 'root';
      if (rule.isLeaf) nodeType = 'leaf';

      // Cria rótulo para exibição
      const label = rule.isLeaf
        ? (rule.subject?.name || 'Ticket Subject')
        : (rule.question || 'Question Node');

      // Cria dados do nó
      const nodeData = {
        id: rule.id,
        label,
        question: rule.question,
        answerTrigger: rule.answerTrigger,
        isLeaf: rule.isLeaf,
        parentId: rule.parentId,
        subjectId: rule.subjectId,
        targetGroupId: rule.targetGroupId,
        subject: rule.subject,
        supportGroup: rule.supportGroup,
        nodeType,
        childrenCount: rule.children?.length || 0,
      };

      // Adiciona nó
      nodes.push({
        id: rule.id,
        data: nodeData,
        type: 'default',
      });

      // Processa filhos e cria arestas
      if (rule.children && rule.children.length > 0) {
        rule.children.forEach((child) => {
          // Recursively process child
          flattenTree(child);

          // Cria aresta do pai para o filho
          edges.push({
            id: `${rule.id}->${child.id}`,
            source: rule.id,
            target: child.id,
            label: child.answerTrigger || '',
            animated: false,
          });
        });
      }
    };

    // Start flattening from all roots
    rules.forEach((root) => flattenTree(root));

    return new ReactFlowTriageRuleDto(nodes, edges);
  }

  /**
   * findAllReactFlow - Retorna toda árvore em formato React Flow
   * Query: GET /triage-rules/react-flow
   */
  async findAllReactFlow(): Promise<ReactFlowTriageRuleDto> {
    const roots = await this.findAll();
    return this.toReactFlowFormat(roots);
  }
}
