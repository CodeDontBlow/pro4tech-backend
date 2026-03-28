import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { PrismaTicketRepository } from './ticket.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [
    TicketService,
    PrismaService,
    PrismaTicketRepository,
  ],
  exports: [TicketService],
})
export class TicketModule {}

