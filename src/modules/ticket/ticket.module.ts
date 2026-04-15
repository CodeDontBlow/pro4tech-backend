import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { TicketController } from './ticket.controller';
import { TriageRuleModule } from '../triage-rule/triage-rule.module';
import { TicketCreateRateLimitGuard } from './guards/ticket-create-rate-limit.guard';

@Module({
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, TicketCreateRateLimitGuard],
  imports: [TriageRuleModule],
  exports: [TicketService, TicketRepository],
})
export class TicketModule {}
