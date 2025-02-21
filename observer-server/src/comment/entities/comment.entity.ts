import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  archivedComment: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);