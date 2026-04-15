import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { TicketController } from './ticket.controller';
import { SupportGroupModule } from '../support-group/support-group.module';
import { TicketSubjectModule } from '../ticket-subject/ticket-subject.module';

@Module({
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
  imports: [SupportGroupModule, TicketSubjectModule],
  exports: [TicketService, TicketRepository],
})
export class TicketModule {}
