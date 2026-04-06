import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { CreateTicketSubjectDto } from './dtos/create-ticket-subject.dto';
import { UpdateTicketSubjectDto } from './dtos/update-ticket-subject.dto';
import { ResponseTicketSubjectDto } from './dtos/response-ticket-subject.dto';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class TicketSubjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateTicketSubjectDto,
  ): Promise<ResponseTicketSubjectDto> {
    return this.prisma.ticketSubject.create({
      data: {
        id: uuidv7(),
        name: data.name,
        description: data.description,
        isActive: true,
      },
    });
  }

  async findAll(
    onlyActive: boolean = true,
  ): Promise<ResponseTicketSubjectDto[]> {
    return this.prisma.ticketSubject.findMany({
      where: onlyActive ? { isActive: true } : {},
    });
  }

  async findById(id: string): Promise<ResponseTicketSubjectDto | null> {
    return this.prisma.ticketSubject.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<ResponseTicketSubjectDto | null> {
    return this.prisma.ticketSubject.findUnique({
      where: { name },
    });
  }

  async update(
    id: string,
    data: UpdateTicketSubjectDto,
  ): Promise<ResponseTicketSubjectDto> {
    return this.prisma.ticketSubject.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ticketSubject.delete({
      where: { id },
    });
  }

  async existsWithId(id: string): Promise<boolean> {
    const subject = await this.prisma.ticketSubject.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!subject;
  }

  async existsWithName(name: string, excludeId?: string): Promise<boolean> {
    const subject = await this.prisma.ticketSubject.findUnique({
      where: { name },
      select: { id: true },
    });
    if (!subject) return false;
    if (excludeId && subject.id === excludeId) return false;
    return true;
  }

  /**
   * Nullifica subjectId em todas as TriageRules que fazem referência a este subject
   * Apenas para folhas (isLeaf = true)
   * @param subjectId ID do subject que será desativado
   * @returns Quantidade de TriageRules atualizadas
   */
  async nullifyTriageRulesSubject(subjectId: string): Promise<number> {
    const result = await this.prisma.triageRule.updateMany({
      where: {
        subjectId: subjectId,
        isLeaf: true,
      },
      data: {
        subjectId: null,
      },
    });
    return result.count;
  }
}
