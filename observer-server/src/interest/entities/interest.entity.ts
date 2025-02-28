import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Interest {
  _id: Types.ObjectId;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  description: string;
}

export type InterestDocument = Interest & Document;
export const InterestSchema = SchemaFactory.createForClass(Interest);
