import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { SupportGroupRepository } from './support-group.repository';
import { CreateSupportGroupDto } from './dtos/create-support-group.dto';
import { UpdateSupportGroupDto } from './dtos/update-support-group.dto';

@Injectable()
export class SupportGroupService {
  private readonly logger = new Logger(SupportGroupService.name);

  constructor(private readonly repository: SupportGroupRepository) {}

  async create(dto: CreateSupportGroupDto) {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      this.logger.warn(`Attempt to create a duplicate group: ${dto.name}`);
      throw new ConflictException('A group with this name already exists.');
    }

    const id = uuidv7();
    return this.repository.create(id, dto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const group = await this.repository.findById(id);
    if (!group) throw new NotFoundException('Group not found.');
    return group;
  }

  async update(id: string, dto: UpdateSupportGroupDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.update(id, {
      deletedAt: new Date(),
      isActive: false,
    });
  }
}
