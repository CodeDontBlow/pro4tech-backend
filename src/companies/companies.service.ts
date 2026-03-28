import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrCodeService } from '../qrcode/qr-code.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AssignClientDto } from './dto/assign-client.dto';

/*
 * Service responsável pela lógica de negócio das Empresas Parceiras.
 * Focado nas subtarefas: PT-79 - PT-78 - PT-80
 */
@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private qrCodeService: QrCodeService
  ) {}

  // PT-78: Criação da empresa com Identificador Manual
  async create(dto: CreateCompanyDto) {

    const accessCode = this.qrCodeService.generateCodeString(dto.name);

    const company = await this.prisma.company.create({
      data: {
        com_name: dto.name,
        com_cnpj: dto.cnpj,
        com_contactEmail: dto.email,
        com_accessCode: accessCode, 
        com_isActive: true,
      },
    });

    // PT-79 & PT-80: Atribuição de empresa para cliente (Manual ou QR)
await this.qrCodeService.generateCompanyQr(company.com_id);

    return company;
  }

  // PT-79 & PT-80: Atribui cliente para empresa (via QR ou Manual Code)
    async assignUser(dto: AssignClientDto) {
    const company = await this.prisma.company.findUnique({
      where: { com_accessCode: dto.accessCode },
    });

    if (!company) {
      throw new NotFoundException('Company not found with this access code.');
    }

    return this.prisma.user.update({
      where: { usr_id: dto.userId },
      data: { usr_companyId: company.com_id },
    });
  }
}