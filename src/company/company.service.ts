import { ConflictException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

//prisma client
import { Role } from '../../generated/prisma/enums';

//services
import { PrismaService } from '../prisma/prisma.service';
import { QrCodeService } from '../qrcode/qr-code.service';
import { UserService } from '../user/user.service';

//repositories
import { CompanyRepository } from './company.repository';

//dtos
import { ResponseCompanyDto } from './dtos/response-company.dto';
import { ResponseUserDto } from 'src/user/dtos/response-user.dto';
import { CreateCompanyWithAdminDto } from './dtos/create-company-with-admin.dto';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly qrCodeService: QrCodeService,
  ) {}

  async createCompanyAndAdminUser(data: CreateCompanyWithAdminDto): Promise<{
    company: ResponseCompanyDto;
    admin: ResponseUserDto;
    qrCode: string;
  }> {
    await this.validateCompanyData(data.company);
    await this.userService.validateEmailNotInUse(data.admin.email);
    await this.userService.validatePhoneNotInUse(data.admin.phone);

    const qr = await this.qrCodeService.generateQr(data.company.name);
    const hashedPassword = await bcrypt.hash(data.admin.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          cnpj: data.company.cnpj,
          name: data.company.name,
          contactName: data.company.contactName,
          contactEmail: data.company.contactEmail,
          accessCode: qr.id,
        },
        select: {
          id: true,
          cnpj: true,
          name: true,
          contactName: true,
          contactEmail: true,
          isActive: true,
          updatedAt: true,
        },
      });

      const admin = await tx.user.create({
        data: {
          companyId: company.id,
          name: data.admin.name,
          phone: data.admin.phone,
          email: data.admin.email,
          hashedPassword,
          role: Role.ADMIN,
        },
        select: {
          id: true,
          companyId: true,
          phone: true,
          email: true,
          name: true,
          role: true,
          chatStatus: true,
          lastSeen: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });

      return { company, admin };
    });

    this.logger.log(
      `Company registered — id: ${result.company.id}, admin: ${result.admin.id}`,
    );

    return {
      company: result.company,
      admin: result.admin,
      qrCode: qr.image,
    };
  }

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

  async update(
    id: string,
    data: UpdateCompanyDto,
  ): Promise<ResponseCompanyDto> {
    await this.validateContactEmailNotInUse(data.contactEmail, id);
    return this.companyRepository.update(id, data);
  }

  async softDelete(id: string): Promise<ResponseCompanyDto> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      this.logger.warn(`Soft delete failed — company not found: ${id}`);
      throw new ConflictException(`Company with id ${id} not found`);
    }
    const deleted = await this.companyRepository.softDelete(id);
    this.logger.log(`Company soft deleted — id: ${id}`);
    return deleted;
  }
}
