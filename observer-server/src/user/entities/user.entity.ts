import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum UserRole {
  ORGANIZER = 'organizer',
  PARTICIPANT = 'participant',
}

export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'City' })
  city: Types.ObjectId;

  @Prop({ type: String, enum: UserRole, default: UserRole.PARTICIPANT })
  role: UserRole;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: null })
  profilePicture: string;

  @Prop({ default: false })
  profileVerified: boolean;

//   @Prop({ type: [{ type: Types.ObjectId, ref: 'Event' }] })
//   attendingEvents: Types.ObjectId[];

//   @Prop({ type: [{ type: Types.ObjectId, ref: 'Event' }] })
//   createdEvents: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

