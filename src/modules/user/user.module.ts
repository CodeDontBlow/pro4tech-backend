import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { AgentModule } from '@modules/agent/agent.module';

@Module({
  imports: [AgentModule],
  providers: [UserRepository, UserService], //injectable
  controllers: [UserController], //controller
  exports: [UserService], //usado em outro módulo
})
export class UserModule {}
