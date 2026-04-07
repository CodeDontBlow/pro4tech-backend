import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { AgentModule } from '@modules/agent/agent.module';
import { CompanyModule } from '@modules/company/company.module';

@Module({
  imports: [AgentModule, CompanyModule],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
