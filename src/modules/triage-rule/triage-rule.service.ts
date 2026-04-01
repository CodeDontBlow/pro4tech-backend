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
    // Validate: if not a leaf, question is required
    if (!data.isLeaf && !data.question) {
      throw new BadRequestException('question is required when isLeaf is false');
    }

    // Validate: if leaf, answerTrigger should be provided
    if (data.isLeaf && !data.answerTrigger) {
      throw new BadRequestException('answerTrigger is required when isLeaf is true');
    }

    // Validate parentId exists if provided
    if (data.parentId) {
      const parentExists = await this.repository.existsWithParentId(data.parentId);
      if (!parentExists) {
        throw new BadRequestException(`Parent triage rule with id ${data.parentId} not found`);
      }

      // Validate no cycles
      const hasCycle = await this.wouldCreateCycle(data.parentId, data.parentId);
      if (hasCycle) {
        throw new BadRequestException('Creating this parent relationship would create a cycle in the tree');
      }
    }

    // Validate targetGroupId exists if provided
    if (data.targetGroupId) {
      const groupExists = await this.prisma.supportGroup.findUnique({
        where: { id: data.targetGroupId },
        select: { id: true },
      });
      if (!groupExists) {
        throw new BadRequestException(`Support group with id ${data.targetGroupId} not found`);
      }
    }

    // Validate subjectId exists and is unique if provided
    if (data.subjectId) {
      const subjectExists = await this.prisma.ticketSubject.findUnique({
        where: { id: data.subjectId },
        select: { id: true },
      });
      if (!subjectExists) {
        throw new BadRequestException(`Ticket subject with id ${data.subjectId} not found`);
      }

      // Check if subject is already used by another triage rule
      const subjectUsed = await this.prisma.triageRule.findUnique({
        where: { subjectId: data.subjectId },
        select: { id: true },
      });
      if (subjectUsed) {
        throw new BadRequestException(`Ticket subject with id ${data.subjectId} is already used by another triage rule`);
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
      throw new NotFoundException(`Triage rule with id ${id} not found`);
    }
    return rule;
  }

  async update(id: string, data: UpdateTriageRuleDto): Promise<ResponseTriageRuleDto> {
    // Verify exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Triage rule with id ${id} not found`);
    }

    // Validate: if not a leaf, question is required (or was already provided)
    if (data.isLeaf === false && !data.question && !existing.question) {
      throw new BadRequestException('question is required when isLeaf is false');
    }

    // Validate targetGroupId if provided
    if (data.targetGroupId) {
      const groupExists = await this.prisma.supportGroup.findUnique({
        where: { id: data.targetGroupId },
        select: { id: true },
      });
      if (!groupExists) {
        throw new BadRequestException(`Support group with id ${data.targetGroupId} not found`);
      }
    }

    // Validate subjectId if provided and changed
    if (data.subjectId && data.subjectId !== existing.subjectId) {
      const subjectExists = await this.prisma.ticketSubject.findUnique({
        where: { id: data.subjectId },
        select: { id: true },
      });
      if (!subjectExists) {
        throw new BadRequestException(`Ticket subject with id ${data.subjectId} not found`);
      }

      // Check if subject is already used by another triage rule
      const subjectUsed = await this.prisma.triageRule.findUnique({
        where: { subjectId: data.subjectId },
        select: { id: true },
      });
      if (subjectUsed) {
        throw new BadRequestException(`Ticket subject with id ${data.subjectId} is already used by another triage rule`);
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Triage rule with id ${id} not found`);
    }

    await this.repository.delete(id);
  }

  async traverse(answerTrigger: string, currentNodeId?: string): Promise<TraverseResponseDto> {
    let parentId: string | null = null;

    // If no current node provided, start from root
    if (!currentNodeId) {
      // Find any root node (parentId is null)
      const roots = await this.prisma.triageRule.findMany({
        where: { parentId: null },
        select: { id: true },
        take: 1,
      });

      if (roots.length === 0) {
        throw new BadRequestException('No root triage rules found');
      }

      parentId = roots[0].id;
    } else {
      parentId = currentNodeId;
    }

    // Find child with matching answerTrigger
    const nextNode = await this.repository.findByAnswerTrigger(answerTrigger, parentId);

    if (!nextNode) {
      throw new BadRequestException(
        `No triage rule found with answerTrigger "${answerTrigger}" under parent node`,
      );
    }

    // Fetch children for response
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

    // Helper: recursively process tree
    const flattenTree = (rule: ResponseTriageRuleDto) => {
      if (processedIds.has(rule.id)) return;
      processedIds.add(rule.id);

      // Determine node type
      let nodeType: 'root' | 'question' | 'leaf' = 'question';
      if (!rule.parentId) nodeType = 'root';
      if (rule.isLeaf) nodeType = 'leaf';

      // Create label for display
      const label = rule.isLeaf
        ? (rule.subject?.name || 'Ticket Subject')
        : (rule.question || 'Question Node');

      // Create node data
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

      // Add node
      nodes.push({
        id: rule.id,
        data: nodeData,
        type: 'default',
      });

      // Process children and create edges
      if (rule.children && rule.children.length > 0) {
        rule.children.forEach((child) => {
          // Recursively process child
          flattenTree(child);

          // Create edge from parent to child
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
