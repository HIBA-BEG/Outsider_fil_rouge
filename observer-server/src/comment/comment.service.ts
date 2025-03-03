import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './entities/comment.entity';
import { Event } from '../event/entities/event.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  async create(
    eventId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const comment = new this.commentModel({
      user: userId,
      event: eventId,
      content: createCommentDto.content,
      archivedComment: false,
    });

    return comment.save();
  }

  async findByEvent(eventId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ event: eventId, archivedComment: false })
      .populate('user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    id: string,
    userId: string,
    content: string,
  ): Promise<Comment> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = content;
    return comment.save();
  }
}