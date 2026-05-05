import { forwardRef, Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { TicketController } from './ticket.controller';
import { TriageRuleModule } from '../triage-rule/triage-rule.module';
import { TicketCreateRateLimitGuard } from './guards/ticket-create-rate-limit.guard';
import { ChatModule } from '@modules/chat/chat.module';


@Module({
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, TicketCreateRateLimitGuard],
  imports: [
    TriageRuleModule,
    forwardRef(() => ChatModule),
  ],
  exports: [TicketRepository, TicketService],
})
export class TicketModule { }