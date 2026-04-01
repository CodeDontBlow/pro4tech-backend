import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
//services
import { AccessCodeService } from '@modules/accessCode/access-code.service';
//repositories
import { CompanyRepository } from './company.repository';
//dtos
import { ResponseCompanyDto } from './dtos/response-company.dto';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { ResponsePaginationDto } from '@common/dtos/response-pagination.dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly accessCodeService: AccessCodeService,
  ) {}

  private async validateCompanyData(companyDto: CreateCompanyDto) {
    const existingCnpj = await this.companyRepository.findByCnpj(
      companyDto.cnpj,
    );

    if (existingCnpj) {
      this.logger.warn(
        `Register failed — CNPJ already in use: ${companyDto.cnpj}`,
      );
      throw new ConflictException(`CNPJ ${companyDto.cnpj} already in use`);
    }

    await this.validateContactEmailNotInUse(companyDto.contactEmail);
  }

  private async validateContactEmailNotInUse(
    contactEmail: string,
    companyIdToIgnore?: string,
  ) {
    if (!contactEmail) return;

    const existingEmail =
      await this.companyRepository.findByContactEmail(contactEmail);

    if (existingEmail && existingEmail.id !== companyIdToIgnore) {
      this.logger.warn(
        `Operation failed — contact email already in use: ${contactEmail}`,
      );
      throw new ConflictException(`Email ${contactEmail} already in use`);
    }
  }

  async create(data: CreateCompanyDto): Promise<ResponseCompanyDto> {
    await this.validateCompanyData(data);

    const accessCode = await this.accessCodeService.generateAccessCode(
      data.name,
    );
    const company = await this.companyRepository.create(data, accessCode.id);

    this.logger.log(`Company created — id: ${company.id}`);
    return company;
  }

  async findAll(query: { page: number; limit: number; search?: string })
    : Promise<ResponsePaginationDto<ResponseCompanyDto>> {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.companyRepository.findAll({
        skip,
        take: limit,
        search: query.search,
      }),
      this.companyRepository.count(query.search),
    ]);
    return new ResponsePaginationDto(data, total, page, limit);
  }

  async update(
    id: string,
    data: UpdateCompanyDto,
  ): Promise<ResponseCompanyDto> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      this.logger.warn(`Update failed — company not found: ${id}`);
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    await this.validateContactEmailNotInUse(data.contactEmail, id);
    return this.companyRepository.update(id, data);
  }

  async softDelete(
    id: string,
    currentCompanyId: string,
  ): Promise<ResponseCompanyDto> {
    if (id === currentCompanyId) {
      this.logger.error(
        `Security alert — Admin tried to delete their own company: ${id}`,
      );
      throw new ConflictException(
        'You cannot delete your own company for security reasons.',
      );
    }

    const company = await this.companyRepository.findById(id);

    if (!company) {
      this.logger.warn(`Soft delete failed — company not found: ${id}`);
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    const deleted = await this.companyRepository.softDelete(id);

    this.logger.log(`Company soft deleted — id: ${id}`);
    return deleted;
  }
}
