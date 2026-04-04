import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketSubjectRepository } from './ticket-subject.repository';
import { CreateTicketSubjectDto } from './dtos/create-ticket-subject.dto';
import { UpdateTicketSubjectDto } from './dtos/update-ticket-subject.dto';
import { ResponseTicketSubjectDto } from './dtos/response-ticket-subject.dto';

@Injectable()
export class TicketSubjectService {
  private readonly logger = new Logger(TicketSubjectService.name);

  constructor(private readonly repository: TicketSubjectRepository) {}

  async create(data: CreateTicketSubjectDto): Promise<ResponseTicketSubjectDto> {
    // Validação: unicidade de nome
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      throw new BadRequestException(`Assunto do tíquete com nome "${data.name}" já existe`);
    }

    return this.repository.create(data);
  }

  async findAll(onlyActive: boolean = true): Promise<ResponseTicketSubjectDto[]> {
    return this.repository.findAll(onlyActive);
  }

  async findById(id: string): Promise<ResponseTicketSubjectDto> {
    const subject = await this.repository.findById(id);
    if (!subject) {
      throw new NotFoundException(`Assunto do tíquete com id ${id} não encontrado`);
    }
    return subject;
  }

  async update(id: string, data: UpdateTicketSubjectDto): Promise<ResponseTicketSubjectDto> {
    // Verifica se existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Assunto do tíquete com id ${id} não encontrado`);
    }

    // Validação: unicidade de nome se o nome está sendo alterado
    if (data.name && data.name !== existing.name) {
      const nameExists = await this.repository.findByName(data.name);
      if (nameExists) {
        throw new BadRequestException(`Assunto do tíquete com nome "${data.name}" já existe`);
      }
    }

    // Se está desativando o subject (isActive = false), nullificar referências em TriageRules
    if (data.isActive === false && existing.isActive === true) {
      const updatedRules = await this.repository.nullifyTriageRulesSubject(id);
      if (updatedRules > 0) {
        this.logger.log(
          `Triage rules updated with null subject — subjectId: ${id}, updated: ${updatedRules}`,
        );
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Assunto do tíquete com id ${id} não encontrado`);
    }

    await this.repository.delete(id);
  }
}
