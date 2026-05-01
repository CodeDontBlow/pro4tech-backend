import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TicketTriageDocument = HydratedDocument<TicketTriage>;

@Schema({ _id: false, versionKey: false })
export class TicketTriageAnswer {
  @Prop({ required: true, trim: true })
  question: string;

  @Prop({ required: true, trim: true })
  answer: string;
}

export const TicketTriageAnswerSchema =
  SchemaFactory.createForClass(TicketTriageAnswer);

@Schema({
  collection: 'triages',
  versionKey: false,
})
export class TicketTriage {
  @Prop({ required: true, unique: true, index: true })
  ticketId: string;

  @Prop({ required: true, index: true })
  triageLeafId: string;

  @Prop({ required: true, type: [TicketTriageAnswerSchema], default: [] })
  answers: TicketTriageAnswer[];

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const TicketTriageSchema = SchemaFactory.createForClass(TicketTriage);
