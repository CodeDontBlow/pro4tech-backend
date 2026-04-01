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
    // Validate name uniqueness
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      throw new BadRequestException(`Ticket subject with name "${data.name}" already exists`);
    }

    return this.repository.create(data);
  }

  async findAll(onlyActive: boolean = true): Promise<ResponseTicketSubjectDto[]> {
    return this.repository.findAll(onlyActive);
  }

  async findById(id: string): Promise<ResponseTicketSubjectDto> {
    const subject = await this.repository.findById(id);
    if (!subject) {
      throw new NotFoundException(`Ticket subject with id ${id} not found`);
    }
    return subject;
  }

  async update(id: string, data: UpdateTicketSubjectDto): Promise<ResponseTicketSubjectDto> {
    // Verify exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Ticket subject with id ${id} not found`);
    }

    // Validate name uniqueness if name is being changed
    if (data.name && data.name !== existing.name) {
      const nameExists = await this.repository.findByName(data.name);
      if (nameExists) {
        throw new BadRequestException(`Ticket subject with name "${data.name}" already exists`);
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Ticket subject with id ${id} not found`);
    }

    await this.repository.delete(id);
  }
}
