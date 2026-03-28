import { Module } from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

//modules
import { QrCodeModule } from '../qrcode/qr-code.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [QrCodeModule, UserModule],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository],
})
export class CompanyModule {}
