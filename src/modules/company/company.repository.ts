import { Injectable } from '@nestjs/common';

//services
import { PrismaService } from '@database/prisma/prisma.service';
import { UpdateCompanyDto } from './dtos/update-company.dto';

const companyPublicSelect = {
  id: true,
  cnpj: true,
  name: true,
  contactName: true,
  contactEmail: true,
  isActive: true,
  updatedAt: true,
  deletedAt: true,
};

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.company.findUnique({
      where: { id: id, deletedAt: null },
      select: {
        ...companyPublicSelect,
      },
    });
  }

  async findByCnpj(cnpj: string) {
    return this.prisma.company.findUnique({
      where: { cnpj: cnpj, deletedAt: null },
      select: {
        ...companyPublicSelect,
      },
    });
  }

  async findByContactEmail(email: string) {
    return this.prisma.company.findUnique({
      where: { contactEmail: email, deletedAt: null },
      select: {
        ...companyPublicSelect,
      },
    });
  }

  async update(id: string, data: UpdateCompanyDto) {
    return this.prisma.company.update({
      where: { id: id, deletedAt: null },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        ...companyPublicSelect,
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.company.update({
      where: { id: id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
      select: {
        ...companyPublicSelect,
      },
    });
  }
}
