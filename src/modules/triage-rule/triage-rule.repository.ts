import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { ResponseTriageRuleDto } from './dtos/response-triage-rule.dto';

@Injectable()
export class TriageRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca recursiva privada para construir arvore completa
   * @param id ID do nó a buscar
   * @param visitedIds Set para detectar ciclos
   * @param currentDepth Profundidade atual
   * @param maxDepth Profundidade máxima (default: 10)
   * @returns Nó com arvore completa de filhos
   */
  private async fetchTriageRuleRecursive(
    id: string,
    visitedIds: Set<string> = new Set(),
    currentDepth: number = 0,
    maxDepth: number = 10,
  ): Promise<ResponseTriageRuleDto | null> {
    // Proteção: profundidade máxima atingida
    if (currentDepth >= maxDepth) {
      return null;
    }

    // Detecção de ciclo
    if (visitedIds.has(id)) {
      return null;
    }

    // Busca o nó atual
    const rule = await this.prisma.triageRule.findUnique({
      where: { id },
      include: {
        children: true,
        subject: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
        supportGroup: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!rule) {
      return null;
    }

    // Marca como visitado
    visitedIds.add(id);

    // Busca recursiva de filhos
    let childrenWithDescendants: ResponseTriageRuleDto[] = [];
    if (rule.children && rule.children.length > 0) {
      for (const child of rule.children) {
        const childWithDescendants = await this.fetchTriageRuleRecursive(
          child.id,
          visitedIds,
          currentDepth + 1,
          maxDepth,
        );

        if (childWithDescendants) {
          childrenWithDescendants.push(childWithDescendants);
        }
      }
    }

    // Retorna objeto com children recursivos
    return {
      ...rule,
      children: childrenWithDescendants,
    } as ResponseTriageRuleDto;
  }

  /**
   * Retorna todas as regras de triagem raizes com suas arvores completas
   * Busca recursiva para cada root a partir do nível 0
   */
  async findAll(): Promise<ResponseTriageRuleDto[]> {
    // Busca todos os nós raiz (parentId = null)
    const roots = await this.prisma.triageRule.findMany({
      where: { parentId: null },
      include: {
        children: true,
        subject: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
        supportGroup: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Aplica recursão para cada root
    const allRulesWithChildren: ResponseTriageRuleDto[] = [];
    const visitedIds = new Set<string>();

    for (const root of roots) {
      const rootWithDescendants = await this.fetchTriageRuleRecursive(
        root.id,
        visitedIds,
        0,
        10,
      );

      if (rootWithDescendants) {
        allRulesWithChildren.push(rootWithDescendants);
      }
    }

    return allRulesWithChildren;
  }

  async findByParentId(parentId: string): Promise<ResponseTriageRuleDto[]> {
    return this.prisma.triageRule.findMany({
      where: { parentId },
      include: {
        children: true,
        subject: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
        supportGroup: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  async findByAnswerTrigger(answerTrigger: string, parentId: string): Promise<ResponseTriageRuleDto | null> {
    return this.prisma.triageRule.findFirst({
      where: {
        answerTrigger,
        parentId,
      },
      include: {
        children: true,
        subject: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
        supportGroup: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }
}
