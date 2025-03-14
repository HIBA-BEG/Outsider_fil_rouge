import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './entities/comment.entity';
import { Event } from '../event/entities/event.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
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
    });

    return comment.save();
  }

  async findByEvent(eventId: string): Promise<Comment[]> {
    return this.commentModel
      .find({
        event: eventId,
        archivedByOwner: false,
        archivedByOrganizer: false,
      })
      .populate('user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, userId: string, content: string): Promise<Comment> {
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

  async archiveByOwner(id: string, userId: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.toString() !== userId) {
      throw new ForbiddenException('You can only archive your own comments');
    }

    comment.archivedByOwner = true;
    return comment.save();
  }

  async archiveByOrganizer(id: string, userId: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const event = await this.eventModel.findById(comment.event);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (event.organizer.toString() !== userId) {
      throw new ForbiddenException(
        'You can only archive comments on your events',
      );
    }

    comment.archivedByOrganizer = true;
    return comment.save();
  }
}
