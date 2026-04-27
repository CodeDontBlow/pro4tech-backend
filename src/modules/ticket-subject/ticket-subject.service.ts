import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TicketSubjectRepository } from './ticket-subject.repository';
import { CreateTicketSubjectDto } from './dtos/create-ticket-subject.dto';
import { UpdateTicketSubjectDto } from './dtos/update-ticket-subject.dto';
import { ResponseTicketSubjectDto } from './dtos/response-ticket-subject.dto';
import { ResponsePaginationDto } from '@common/dtos/response-pagination.dto';

@Injectable()
export class TicketSubjectService {
  private readonly logger = new Logger(TicketSubjectService.name);

  constructor(private readonly repository: TicketSubjectRepository) {}

  async create(
    data: CreateTicketSubjectDto,
  ): Promise<ResponseTicketSubjectDto> {
    // Validação: unicidade de nome
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      throw new BadRequestException(
        `Assunto do tíquete com nome "${data.name}" já existe`,
      );
    }

    return this.repository.create(data);
  }

  async findAll(
    onlyActive: boolean = true,
    page: number = 1,
    limit: number = 10,
    name?: string,
  ): Promise<ResponsePaginationDto<ResponseTicketSubjectDto>> {
    const normalizedPage = this.normalizePage(page);
    const normalizedLimit = this.normalizeLimit(limit);
    const skip = (normalizedPage - 1) * normalizedLimit;
    const normalizedName = name?.trim();

    const [subjects, total] = await Promise.all([
      this.repository.findAll({
        onlyActive,
        name: normalizedName,
        skip,
        take: normalizedLimit,
      }),
      this.repository.count(onlyActive, normalizedName),
    ]);

    return new ResponsePaginationDto(
      subjects,
      total,
      normalizedPage,
      normalizedLimit,
    );
  }

  async findById(id: string): Promise<ResponseTicketSubjectDto> {
    const subject = await this.repository.findById(id);
    if (!subject) {
      throw new NotFoundException(
        `Assunto do tíquete com id ${id} não encontrado`,
      );
    }
    return subject;
  }

  async update(
    id: string,
    data: UpdateTicketSubjectDto,
  ): Promise<ResponseTicketSubjectDto> {
    // Verifica se existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(
        `Assunto do tíquete com id ${id} não encontrado`,
      );
    }

    // Validação: unicidade de nome se o nome está sendo alterado
    if (data.name && data.name !== existing.name) {
      const nameExists = await this.repository.findByName(data.name);
      if (nameExists) {
        throw new BadRequestException(
          `Assunto do tíquete com nome "${data.name}" já existe`,
        );
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
      throw new NotFoundException(
        `Assunto do tíquete com id ${id} não encontrado`,
      );
    }

    await this.repository.delete(id);
  }

  private normalizePage(page: number): number {
    if (!Number.isFinite(page) || page < 1) {
      return 1;
    }

    return Math.floor(page);
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isFinite(limit) || limit < 1) {
      return 10;
    }

    return Math.min(Math.floor(limit), 100);
  }
}
