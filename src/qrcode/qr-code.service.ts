import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import * as QRCode from 'qrcode';

export interface ReturnQr {
  id: string;
  image: string;
}

@Injectable()
export class QrCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async generateCompanyQr(companyId: string): Promise<ReturnQr> {
    const company = await this.prisma.company.findUnique({
      where: { com_id: companyId },
    });

    if (!company) {
      console.error(`Company ${companyId} not found`);
      throw new BadRequestException('Company not found in database.');
    }

    const accessCode = company.com_accessCode;

    if (!accessCode) {
      throw new BadRequestException('Company has no access code generated.');
    }

    try {
      // Gera a imagem do QR code
      const image = await QRCode.toDataURL(`ID:${companyId};CODE:${accessCode}`, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 10
      });

      return { 
        id: accessCode, 
        image: image 
      };
    } catch (err) {
      console.error('QR Generation failed:', err);
      throw new InternalServerErrorException('Error generating QR Code image.');
    }
  }
  generateCodeString(name: string): string {
    const prefix = name.substring(0, 3).toUpperCase().padEnd(3, 'X');
    const suffix = randomBytes(3).toString('hex').toLowerCase();
    return `${prefix}-${suffix}`;
  }
}
