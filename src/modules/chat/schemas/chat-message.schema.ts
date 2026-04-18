import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'generated/prisma/client';
import { HydratedDocument } from 'mongoose';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({
  collection: 'messages',
  versionKey: false,
})
export class ChatMessage {
  @Prop({ required: true, index: true })
  ticketId: string;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true, enum: Object.values(Role) })
  senderRole: Role;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  content: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ ticketId: 1, createdAt: 1 });
