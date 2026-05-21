import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'generated/prisma/client';
import { HydratedDocument } from 'mongoose';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({ _id: false })
class ChatAttachment {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;
}

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

  @Prop({ trim: true, maxlength: 2000, default: '' })
  content: string;

  @Prop({ type: [ChatAttachment], default: [] })
  attachments?: ChatAttachment[];

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop()
  editedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ ticketId: 1, createdAt: 1 });
