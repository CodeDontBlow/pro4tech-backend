import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as QRCode from 'qrcode';
import { generateCompanyAccessCode } from './access-code.util';

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
export class AccessCodeService {
  private readonly logger = new Logger(AccessCodeService.name);

  async generateAccessCode(company: string): Promise<ReturnQr> {
    if (!company?.trim()) {
      throw new BadRequestException('Company name is required.');
    }

    const id = generateCompanyAccessCode();
    const text = `ID:${id};CMP:${company}`;

    try {
      const image = await QRCode.toDataURL(text, config);
      this.logger.log(`QR Code generated - ID: ${id}, Company: ${company}`);
      return { id, image };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to generate QR for company ${company}: ${errorMessage}`,
      );
      throw new InternalServerErrorException('Generation failed.');
    }
  }
}
