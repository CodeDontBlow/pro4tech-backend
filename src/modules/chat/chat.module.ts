import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@modules/auth/auth.module';
import { TicketModule } from '@modules/ticket/ticket.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: ChatMessage.name,
        schema: ChatMessageSchema,
      },
    ]),
    forwardRef(() => TicketModule),
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
})
export class ChatModule { }