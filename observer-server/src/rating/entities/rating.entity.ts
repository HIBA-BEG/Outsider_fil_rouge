import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Max, Min } from 'class-validator';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Rating {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  participant: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  @Min(1)
  @Max(5)
  score: number;
}

export type RatingDocument = Rating & Document;
export const RatingSchema = SchemaFactory.createForClass(Rating);
