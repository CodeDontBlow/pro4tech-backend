import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@modules/auth/auth.module';
import { TicketModule } from '@modules/ticket/ticket.module';
import { TriageRuleModule } from '@modules/triage-rule/triage-rule.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { StorageModule } from '@modules/storage/storage.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    AuthModule,
    TicketModule,
    TriageRuleModule,
    StorageModule,
    MongooseModule.forFeature([
      {
        name: ChatMessage.name,
        schema: ChatMessageSchema,
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
