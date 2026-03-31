import { Module } from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

//modules
import { AccessCodeModule } from '@modules/accessCode/accessCode.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [AccessCodeModule, UserModule],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository],
})
export class CompanyModule {}
