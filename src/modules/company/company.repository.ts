import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';

//services
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { ResponseCompanyDto } from './dtos/response-company.dto';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ResponseCompanyDto | null> {
    return this.prisma.company.findUnique({
      where: { id: id, deletedAt: null },
    });
  }

  async findByCnpj(cnpj: string): Promise<ResponseCompanyDto | null> {
    return this.prisma.company.findUnique({
      where: { cnpj: cnpj, deletedAt: null },
    });
  }

  async findByContactEmail(email: string): Promise<ResponseCompanyDto | null> {
    return this.prisma.company.findUnique({
      where: { contactEmail: email, deletedAt: null },
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
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<ResponseCompanyDto[]> {
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    data: UpdateCompanyDto,
  ): Promise<ResponseCompanyDto> {
    return this.prisma.company.update({
      where: { id: id, deletedAt: null },
      data: {
        ...data,
      },
    });
  }

  async softDelete(id: string): Promise<ResponseCompanyDto> {
    return this.prisma.company.update({
      where: {
        id: id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
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
