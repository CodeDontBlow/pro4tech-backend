import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'generated/prisma/client';
import { HydratedDocument } from 'mongoose';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

export enum ChatMessageType {
  USER = 'USER',
  TRIAGE_SUMMARY = 'TRIAGE_SUMMARY',
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

  @Prop({
    required: true,
    enum: Object.values(ChatMessageType),
    default: ChatMessageType.USER,
  })
  messageType: ChatMessageType;

  @Prop({ type: [String], enum: Object.values(Role), default: undefined })
  visibleToRoles?: Role[];

  @Prop({ required: true, trim: true, maxlength: 2000 })
  content: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop()
  editedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ ticketId: 1, createdAt: 1 });
ChatMessageSchema.index({ ticketId: 1, messageType: 1 });
