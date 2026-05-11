import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@modules/auth/auth.module';
import { TicketModule } from '@modules/ticket/ticket.module';
import { TriageRuleModule } from '@modules/triage-rule/triage-rule.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';

@Module({
  imports: [
    AuthModule,
    TicketModule,
    TriageRuleModule,
    MongooseModule.forFeature([
      {
        name: ChatMessage.name,
        schema: ChatMessageSchema,
      },
    ]),
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
