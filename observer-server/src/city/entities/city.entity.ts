import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class City extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  admin_name: string;

  @Prop({ type: Object })
  coordinates: {
    latitude: number;
    longitude: number;
  };

  @Prop()
  population: number;

  @Prop({ default: true })
  isVerified: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ index: true })
  searchText: string;
}

export const CitySchema = SchemaFactory.createForClass(City);

CitySchema.index({ name: 'text', admin_name: 'text' });
