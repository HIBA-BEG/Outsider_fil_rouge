import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Number, Types } from 'mongoose';

export enum EventStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  location: string;

  @Prop()
  poster: string;

  @Prop({ required: true })
  maxParticipants: Number;

  @Prop({ required: true })
  price: GLfloat;

  @Prop({ type: Types.ObjectId, ref: 'Interest', required: true })
  interests: Types.ObjectId[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ type: String, enum: EventStatus, default: EventStatus.SCHEDULED })
  status: EventStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizer: Types.ObjectId;
}

export const EventSchema = SchemaFactory.createForClass(Event);
