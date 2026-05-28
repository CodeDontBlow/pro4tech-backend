import { Module } from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

//modules
import { AccessCodeModule } from '@modules/accessCode/access-code.module';
import { StorageModule } from '@modules/storage/storage.module';

@Module({
  imports: [AccessCodeModule, StorageModule],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository],
  exports: [CompanyService],
})
export class CompanyModule {}
