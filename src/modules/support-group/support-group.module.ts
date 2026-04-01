import { Module } from '@nestjs/common';
import { SupportGroupService } from './support-group.service';
import { SupportGroupController } from './support-group.controller';
import { SupportGroupRepository } from './support-group.repository';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupportGroupController],
  providers: [SupportGroupService, SupportGroupRepository],
  exports: [SupportGroupService],
})
export class SupportGroupModule {}
