import { Module } from '@nestjs/common';
import { PrismaModule } from '@database/prisma/prisma.module';
import { TicketSubjectController } from './ticket-subject.controller';
import { TicketSubjectService } from './ticket-subject.service';
import { TicketSubjectRepository } from './ticket-subject.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TicketSubjectController],
  providers: [TicketSubjectService, TicketSubjectRepository],
  exports: [TicketSubjectService],
})
export class TicketSubjectModule {}
