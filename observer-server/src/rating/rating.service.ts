import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating } from './entities/rating.entity';
import { Event } from '../event/entities/event.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  async create(
    eventId: string,
    userId: string,
    createRatingDto: CreateRatingDto,
  ): Promise<Rating> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isRegistered = event.registeredUsers.some(
      (id) => id.toString() === userId,
    );

    if (!isRegistered) {
      throw new ForbiddenException(
        'Only registered participants can rate events',
      );
    }

    if (new Date() < new Date(event.endDate)) {
      throw new ForbiddenException('Cannot rate an event before it has ended');
    }

    const existingRating = await this.ratingModel.findOne({
      event: eventId,
      user: userId,
    });

    if (existingRating) {
      throw new ForbiddenException('You have already rated this event');
    }

    const rating = new this.ratingModel({
      user: userId,
      event: eventId,
      score: createRatingDto.score,
    });

    return rating.save();
  }

  async getEventAverageRating(eventId: string): Promise<number> {
    const ratings = await this.ratingModel.find({ event: eventId });
    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return sum / ratings.length;
  }

  async getEventRatings(eventId: string): Promise<Rating[]> {
    return this.ratingModel
      .find({ event: eventId })
      .populate('user', 'firstName lastName')
      .exec();
  }

  async cancelRating(eventId: string, userId: string): Promise<Rating> {
    const rating = await this.ratingModel.findOneAndDelete({
      event: eventId,
      user: userId,
    });
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }
    return rating;
  }
}
