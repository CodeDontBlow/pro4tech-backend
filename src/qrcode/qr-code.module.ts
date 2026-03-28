import { Module } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], 
  providers: [QrCodeService],
  exports: [QrCodeService], 
})

export class QrCodeModule {}