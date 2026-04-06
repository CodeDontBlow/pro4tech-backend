import { Injectable, BadRequestException } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { TriageRuleRepository } from './triage-rule.repository';
import { ResponseTriageRuleDto } from './dtos/response-triage-rule.dto';
import { TraverseResponseDto } from './dtos/traverse-triage-rule.dto';
import {
  SyncTriageRuleNodeDto,
  SyncTriageRuleResponseDto,
} from './dtos/sync-triage-rule.dto';
import { PrismaService } from '@database/prisma/prisma.service';

type NormalizedSyncNode = {
  inputId: string;
  parentInputId: string | null;
  question: string | null;
  answerTrigger: string | null;
  isLeaf: boolean;
  targetGroupId: string | null;
  subjectId: string | null;
  depth: number;
};

type ExistingRuleSnapshot = {
  id: string;
  parentId: string | null;
  question: string | null;
  answerTrigger: string | null;
  isLeaf: boolean;
  targetGroupId: string | null;
  subjectId: string | null;
};

@Injectable()
export class TriageRuleService {
  constructor(
    private readonly repository: TriageRuleRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<ResponseTriageRuleDto[]> {
    return this.repository.findAll();
  }

  async syncDiagram(root: SyncTriageRuleNodeDto): Promise<SyncTriageRuleResponseDto> {
    const normalizedNodes = this.normalizeAndFlattenTree(root);
    this.validateBusinessRules(normalizedNodes);

    const existingRules = await this.getExistingRulesSnapshot();
    this.validateRootStability(normalizedNodes, existingRules);
    await this.validateForeignKeys(normalizedNodes);

    const existingById = new Map(existingRules.map((rule) => [rule.id, rule]));
    const incomingIds = new Set(normalizedNodes.map((node) => node.inputId));

    const nodesToCreate = normalizedNodes
      .filter((node) => !existingById.has(node.inputId))
      .sort((a, b) => a.depth - b.depth);

    const nodesToUpdate = normalizedNodes
      .filter((node) => existingById.has(node.inputId))
      .sort((a, b) => a.depth - b.depth);

    const idsToDelete = existingRules
      .filter((rule) => !incomingIds.has(rule.id))
      .map((rule) => rule.id);

    const resolvedIdByInputId = new Map<string, string>();
    for (const node of nodesToUpdate) {
      resolvedIdByInputId.set(node.inputId, node.inputId);
    }

    const idMapping: Record<string, string> = {};
    let nodesCreated = 0;
    let nodesUpdated = 0;
    let nodesDeleted = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const node of nodesToCreate) {
        const persistedId = uuidv7();
        const resolvedParentId = this.resolveParentId(node, resolvedIdByInputId);

        await tx.triageRule.create({
          data: {
            id: persistedId,
            parentId: resolvedParentId,
            question: node.question,
            answerTrigger: node.answerTrigger,
            isLeaf: node.isLeaf,
            targetGroupId: node.targetGroupId,
            subjectId: node.subjectId,
          },
        });

        resolvedIdByInputId.set(node.inputId, persistedId);
        idMapping[node.inputId] = persistedId;
        nodesCreated += 1;
      }

      for (const node of nodesToUpdate) {
        const persistedId = resolvedIdByInputId.get(node.inputId);
        if (!persistedId) {
          throw new BadRequestException(`Não foi possível resolver o ID persistido para o nó ${node.inputId}`);
        }

        const existingNode = existingById.get(node.inputId);
        if (!existingNode) {
          throw new BadRequestException(`Nó ${node.inputId} não encontrado para atualização`);
        }

        const resolvedParentId = this.resolveParentId(node, resolvedIdByInputId);
        if (!this.hasNodeChanged(existingNode, node, resolvedParentId)) {
          continue;
        }

        await tx.triageRule.update({
          where: { id: persistedId },
          data: {
            parentId: resolvedParentId,
            question: node.question,
            answerTrigger: node.answerTrigger,
            isLeaf: node.isLeaf,
            targetGroupId: node.targetGroupId,
            subjectId: node.subjectId,
          },
        });

        nodesUpdated += 1;
      }

      if (idsToDelete.length > 0) {
        const deleted = await tx.triageRule.deleteMany({
          where: {
            id: {
              in: idsToDelete,
            },
          },
        });

        nodesDeleted = deleted.count;
      }
    });

    return {
      nodesCreated,
      nodesUpdated,
      nodesDeleted,
      idMapping,
    };
  }

  async traverse(
    answerTrigger: string,
    currentNodeId?: string,
  ): Promise<TraverseResponseDto> {
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
        throw new BadRequestException(
          'Nenhuma regra de triagem raiz encontrada',
        );
      }

      parentId = roots[0].id;
    } else {
      parentId = currentNodeId;
    }

    // Encontra filho com resposta disparadora correspondente
    const nextNode = await this.repository.findByAnswerTrigger(
      answerTrigger,
      parentId,
    );

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
            isActive: nextNode.subject.isActive,
          }
        : undefined,
      targetGroupId: nextNode.targetGroupId,
    };
  }

  private resolveParentId(
    node: NormalizedSyncNode,
    resolvedIdByInputId: Map<string, string>,
  ): string | null {
    if (!node.parentInputId) {
      return null;
    }

    const resolvedParentId = resolvedIdByInputId.get(node.parentInputId);
    if (!resolvedParentId) {
      throw new BadRequestException(`Pai ${node.parentInputId} não resolvido para o nó ${node.inputId}`);
    }

    return resolvedParentId;
  }

  private normalizeAndFlattenTree(root: SyncTriageRuleNodeDto): NormalizedSyncNode[] {
    if (!root) {
      throw new BadRequestException('Payload inválido: o root do diagrama é obrigatório');
    }

    const flattened: NormalizedSyncNode[] = [];
    const seenIds = new Set<string>();

    const visit = (
      node: SyncTriageRuleNodeDto,
      expectedParentId: string | null,
      depth: number,
      ancestry: Set<string>,
    ): void => {
      if (!node || typeof node !== 'object') {
        throw new BadRequestException('Payload inválido: nó malformado no diagrama');
      }

      const inputId = this.requireNonEmptyString(node.id, 'id');
      if (ancestry.has(inputId)) {
        throw new BadRequestException(`Ciclo detectado no nó ${inputId}`);
      }

      if (seenIds.has(inputId)) {
        throw new BadRequestException(`ID duplicado no diagrama: ${inputId}`);
      }

      const declaredParentId = this.normalizeNullableString(node.parentId);
      if (declaredParentId !== expectedParentId) {
        throw new BadRequestException(
          `parentId inválido para o nó ${inputId}. Esperado ${expectedParentId ?? 'null'} e recebido ${declaredParentId ?? 'null'}`,
        );
      }

      const normalizedNode: NormalizedSyncNode = {
        inputId,
        parentInputId: expectedParentId,
        question: this.normalizeNullableString(node.question),
        answerTrigger: this.normalizeNullableString(node.answerTrigger),
        isLeaf: node.isLeaf === true,
        targetGroupId: this.normalizeNullableString(node.targetGroupId),
        subjectId: this.normalizeNullableString(node.subjectId),
        depth,
      };

      flattened.push(normalizedNode);
      seenIds.add(inputId);

      const children = Array.isArray(node.children) ? node.children : [];
      if (normalizedNode.isLeaf && children.length > 0) {
        throw new BadRequestException(`O nó folha ${inputId} não pode conter children`);
      }

      ancestry.add(inputId);
      for (const child of children) {
        visit(child, inputId, depth + 1, ancestry);
      }
      ancestry.delete(inputId);
    };

    visit(root, null, 0, new Set<string>());
    return flattened;
  }

  private validateBusinessRules(nodes: NormalizedSyncNode[]): void {
    const roots = nodes.filter((node) => node.parentInputId === null);
    if (roots.length !== 1) {
      throw new BadRequestException('O payload deve conter exatamente um root');
    }

    const root = roots[0];
    if (root.isLeaf) {
      throw new BadRequestException('O nó root não pode ser folha');
    }

    for (const node of nodes) {
      if (node.isLeaf) {
        if (!node.answerTrigger) {
          throw new BadRequestException(`answerTrigger é obrigatório para o nó folha ${node.inputId}`);
        }
        if (node.question) {
          throw new BadRequestException(`Nó folha ${node.inputId} não pode possuir question`);
        }
        continue;
      }

      if (!node.question) {
        throw new BadRequestException(`question é obrigatório para o nó não-folha ${node.inputId}`);
      }
      if (node.targetGroupId) {
        throw new BadRequestException(`Nó não-folha ${node.inputId} não pode possuir targetGroupId`);
      }
      if (node.subjectId) {
        throw new BadRequestException(`Nó não-folha ${node.inputId} não pode possuir subjectId`);
      }
    }
  }

  private validateRootStability(
    incomingNodes: NormalizedSyncNode[],
    existingRules: ExistingRuleSnapshot[],
  ): void {
    const incomingRoot = incomingNodes.find((node) => node.parentInputId === null);
    if (!incomingRoot) {
      throw new BadRequestException('O payload deve conter um root válido');
    }

    const existingRoots = existingRules.filter((rule) => rule.parentId === null);
    if (existingRoots.length > 1) {
      throw new BadRequestException('Estrutura atual inválida: existe mais de um root persistido');
    }

    if (existingRoots.length === 0) {
      if (existingRules.length > 0) {
        throw new BadRequestException('Estrutura atual inválida: existem nós persistidos sem root');
      }
      return;
    }

    if (incomingRoot.inputId !== existingRoots[0].id) {
      throw new BadRequestException('Não é permitido alterar o ID do nó root');
    }
  }

  private async validateForeignKeys(nodes: NormalizedSyncNode[]): Promise<void> {
    const groupIds = Array.from(
      new Set(
        nodes
          .map((node) => node.targetGroupId)
          .filter((groupId): groupId is string => !!groupId),
      ),
    );

    const subjectIds = Array.from(
      new Set(
        nodes
          .map((node) => node.subjectId)
          .filter((subjectId): subjectId is string => !!subjectId),
      ),
    );

    const [groups, subjects] = await Promise.all([
      groupIds.length > 0
        ? this.prisma.supportGroup.findMany({
            where: { id: { in: groupIds } },
            select: { id: true },
          })
        : Promise.resolve([]),
      subjectIds.length > 0
        ? this.prisma.ticketSubject.findMany({
            where: { id: { in: subjectIds } },
            select: { id: true },
          })
        : Promise.resolve([]),
    ]);

    const existingGroupIds = new Set(groups.map((group) => group.id));
    const missingGroupIds = groupIds.filter((id) => !existingGroupIds.has(id));
    if (missingGroupIds.length > 0) {
      throw new BadRequestException(
        `Grupo(s) de suporte não encontrado(s): ${missingGroupIds.join(', ')}`,
      );
    }

    const existingSubjectIds = new Set(subjects.map((subject) => subject.id));
    const missingSubjectIds = subjectIds.filter((id) => !existingSubjectIds.has(id));
    if (missingSubjectIds.length > 0) {
      throw new BadRequestException(
        `Assunto(s) não encontrado(s): ${missingSubjectIds.join(', ')}`,
      );
    }
  }

  private async getExistingRulesSnapshot(): Promise<ExistingRuleSnapshot[]> {
    return this.prisma.triageRule.findMany({
      select: {
        id: true,
        parentId: true,
        question: true,
        answerTrigger: true,
        isLeaf: true,
        targetGroupId: true,
        subjectId: true,
      },
    });
  }

  private hasNodeChanged(
    existingNode: ExistingRuleSnapshot,
    incomingNode: NormalizedSyncNode,
    resolvedParentId: string | null,
  ): boolean {
    return (
      existingNode.parentId !== resolvedParentId
      || existingNode.question !== incomingNode.question
      || existingNode.answerTrigger !== incomingNode.answerTrigger
      || existingNode.isLeaf !== incomingNode.isLeaf
      || existingNode.targetGroupId !== incomingNode.targetGroupId
      || existingNode.subjectId !== incomingNode.subjectId
    );
  }

  private requireNonEmptyString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(`Campo ${fieldName} deve ser uma string válida`);
    }

    const normalized = value.trim();
    if (!normalized) {
      throw new BadRequestException(`Campo ${fieldName} é obrigatório`);
    }

    return normalized;
  }

  private normalizeNullableString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
}
