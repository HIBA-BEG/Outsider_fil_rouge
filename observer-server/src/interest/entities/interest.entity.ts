import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export class Interest extends Document {
  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  description: string;
}

export const InterestSchema = SchemaFactory.createForClass(Interest);

