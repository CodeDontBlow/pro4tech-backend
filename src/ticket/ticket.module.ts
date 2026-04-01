import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma/prisma.module';
import { TicketService } from './ticket.service';
import { PrismaTicketRepository } from './ticket.repository';

@Module({
  imports: [PrismaModule],
  providers: [TicketService, PrismaTicketRepository],
  exports: [TicketService],
})
export class TicketModule {}
