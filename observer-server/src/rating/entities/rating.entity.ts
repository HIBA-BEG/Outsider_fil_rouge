import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { Max, Min } from "class-validator";
import { Types } from "mongoose";

export class Rating {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5  })
  @Min(1)
  @Max(5)
  score: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);