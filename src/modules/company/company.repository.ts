import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';

//services
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { ResponseCompanyDto } from './dtos/response-company.dto';

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

  async create(
    data: CreateCompanyDto,
    accessCodeId: string,
  ): Promise<ResponseCompanyDto> {
    return this.prisma.company.create({
      data: {
        id: uuidv7(),
        cnpj: data.cnpj,
        name: data.name,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        accessCode: accessCodeId,
        isActive: true,
      },
      select: {
        ...companyPublicSelect,
      },
    });
  }

  async findAll(params: { skip?: number; take?: number; search?: string }) {
    const { skip, take, search } = params;

    return this.prisma.company.findMany({
      skip,
      take,
      where: {
        deletedAt: null,
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { cnpj: { contains: search } },
            ]
          : undefined,
      },
      select: {
        ...companyPublicSelect,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateCompanyDto) {
    return this.prisma.company.update({
      where: { id: id, deletedAt: null },
      data: {
        ...data,
      },
      select: {
        ...companyPublicSelect,
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.company.update({
      where: {
        id: id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
      select: {
        ...companyPublicSelect,
      },
    });
  }

  async count(search?: string): Promise<number> {
    return this.prisma.company.count({
      where: {
        deletedAt: null,
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { cnpj: { contains: search } },
            ]
          : undefined,
      },
    });
  }
}
