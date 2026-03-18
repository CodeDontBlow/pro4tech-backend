import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import * as QRCode from 'qrcode';

export interface RetornoQr {
  id: string;
  imagem: string;
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
export class GeradorQrService {
  private readonly logger = new Logger(GeradorQrService.name);

  async criarQr(empresa: string): Promise<RetornoQr> {
    const id = this.gerarId();
    const texto = `ID:${id};CMP:${empresa}`;

    try {
      const imagem = await QRCode.toDataURL(texto, config);
      return { id, imagem };
    } catch (error) {
      this.logger.error(`Erro ao gerar QR para a empresa ${empresa}: ${error.message}`);
      throw new InternalServerErrorException('Falha na geração.');
    }
  }

  private gerarId(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }
}
