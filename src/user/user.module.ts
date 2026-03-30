import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';

@Module({
  providers: [UserRepository, UserService], //injectable
  controllers: [UserController], //controller
  exports: [UserService], //usado em outro módulo
})
export class UserModule {}
