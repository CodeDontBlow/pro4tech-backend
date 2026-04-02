import { Module } from '@nestjs/common';
import { SupportGroupService } from './support-group.service';
import { SupportGroupController } from './support-group.controller';
import { SupportGroupRepository } from './support-group.repository';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SupportGroupController],
  providers: [SupportGroupService, SupportGroupRepository],
  exports: [SupportGroupService],
})
export class SupportGroupModule {}