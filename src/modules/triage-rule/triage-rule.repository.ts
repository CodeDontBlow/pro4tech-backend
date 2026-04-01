import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { CreateTriageRuleDto } from './dtos/create-triage-rule.dto';
import { UpdateTriageRuleDto } from './dtos/update-triage-rule.dto';
import { ResponseTriageRuleDto } from './dtos/response-triage-rule.dto';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class TriageRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTriageRuleDto): Promise<ResponseTriageRuleDto> {
    return this.prisma.triageRule.create({
      data: {
        id: uuidv7(),
        question: data.question,
        answerTrigger: data.answerTrigger,
        isLeaf: data.isLeaf || false,
        parentId: data.parentId,
        targetGroupId: data.targetGroupId,
        subjectId: data.subjectId || null,
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

  async findAll(): Promise<ResponseTriageRuleDto[]> {
    const allRules = await this.prisma.triageRule.findMany({
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
    return allRules;
  }

  async findById(id: string): Promise<ResponseTriageRuleDto | null> {
    return this.prisma.triageRule.findUnique({
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

  async update(id: string, data: UpdateTriageRuleDto): Promise<ResponseTriageRuleDto> {
    return this.prisma.triageRule.update({
      where: { id },
      data: {
        question: data.question,
        answerTrigger: data.answerTrigger,
        isLeaf: data.isLeaf,
        targetGroupId: data.targetGroupId,
        subjectId: data.subjectId,
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

  async delete(id: string): Promise<void> {
    await this.prisma.triageRule.delete({
      where: { id },
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

  async existsWithId(id: string): Promise<boolean> {
    const rule = await this.prisma.triageRule.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!rule;
  }

  async existsWithParentId(parentId: string): Promise<boolean> {
    const rule = await this.prisma.triageRule.findUnique({
      where: { id: parentId },
      select: { id: true },
    });
    return !!rule;
  }
}
