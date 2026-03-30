import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import * as QRCode from 'qrcode';

export interface ReturnQr {
  id: string;
  image: string;
}

const config: QRCode.QRCodeToDataURLOptions = {
  errorCorrectionLevel: 'M',
  margin: 2,
  scale: 10,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

@Injectable()
export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);

  async generateQr(company: string): Promise<ReturnQr> {
    if (!company?.trim()) {
      throw new BadRequestException('Company name is required.');
    }

    const id = this.generateId();
    const text = `ID:${id};CMP:${company}`;

    try {
      const image = await QRCode.toDataURL(text, config);
      this.logger.log(`QR Code generated - ID: ${id}, Company: ${company}`);
      return { id, image };
    } catch (error) {
      this.logger.error(
        `Failed to generate QR for company ${company}: ${error.message}`,
      );
      throw new InternalServerErrorException('Generation failed.');
    }
  }

  private generateId(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }
}
