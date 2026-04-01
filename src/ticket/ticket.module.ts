import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { PrismaService } from '../prisma/prisma.service';
import { TicketController } from './ticket.controller';

@Module({
  providers: [
    TicketService,
    PrismaService,
    TicketRepository,
    TicketController
  ],
  exports: [TicketService],
})
export class TicketModule {}

