import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { AgentModule } from '@modules/agent/agent.module';
import { CompanyModule } from '@modules/company/company.module';
import { StorageModule } from '@modules/storage/storage.module';

@Module({
  imports: [AgentModule, CompanyModule, StorageModule],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserService, UserRepository],
})
export class UserModule {}
