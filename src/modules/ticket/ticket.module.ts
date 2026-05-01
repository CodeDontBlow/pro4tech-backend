import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { TicketController } from './ticket.controller';
import { TriageRuleModule } from '../triage-rule/triage-rule.module';
import { TicketCreateRateLimitGuard } from './guards/ticket-create-rate-limit.guard';
import {
  TicketTriage,
  TicketTriageSchema,
} from './schemas/ticket-triage.schema';

@Module({
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, TicketCreateRateLimitGuard],
  imports: [
    TriageRuleModule,
    MongooseModule.forFeature([
      {
        name: TicketTriage.name,
        schema: TicketTriageSchema,
      },
    ]),
  ],
  exports: [TicketService, TicketRepository],
})
export class TicketModule {}
