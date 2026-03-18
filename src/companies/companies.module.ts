import { Module } from '@nestjs/common';
import { GeradorQrService } from './geradorQR.service';

@Module({
  providers: [GeradorQrService],
  exports: [GeradorQrService],
})
export class CompaniesModule {}