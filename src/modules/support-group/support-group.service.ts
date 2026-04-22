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
import { ResponsePaginationDto } from '@common/dtos/response-pagination.dto';
import { SupportGroup } from 'generated/prisma/client';

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

    const generateUuidV7 = uuidv7 as unknown as () => string;
    const id = generateUuidV7();
    return this.repository.create(id, dto);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<ResponsePaginationDto<SupportGroup>> {
    const normalizedPage = this.normalizePage(page);
    const normalizedLimit = this.normalizeLimit(limit);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const [groups, total] = await Promise.all([
      this.repository.findAll({ skip, take: normalizedLimit }),
      this.repository.count(),
    ]);

    return new ResponsePaginationDto(
      groups,
      total,
      normalizedPage,
      normalizedLimit,
    );
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

    const normalizedLimit = Math.floor(limit);
    return Math.min(normalizedLimit, 100);
  }
}
