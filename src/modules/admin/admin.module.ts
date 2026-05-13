import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserRepository } from '@modules/user/user.repository';

@Module({
  controllers: [AdminController],
  providers: [AdminService, UserRepository],
  exports: [AdminService],
})
export class AdminModule {}
