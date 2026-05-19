
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TicketModule } from '../ticket/ticket.module';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [TicketModule, ChatModule, UserModule],
    controllers: [DashboardController],
    providers: [DashboardService]
})
export class DashboardModule {} 