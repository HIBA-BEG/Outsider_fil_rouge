import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User, UserRole } from '../user/entities/user.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.ORGANIZER) {
      throw new ForbiddenException('Only organizers can create events');
    }

    const event = new this.eventModel({
      ...createEventDto,
      organizer: userId,
    });
    const savedEvent = await event.save();

    await this.userModel.findByIdAndUpdate(userId, {
      $push: { createdEvents: savedEvent._id },
    });

    return savedEvent;
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel
      .find({ isArchived: false })
      .populate('organizer', 'firstName lastName email')
      .populate('interests', 'category description')
      .exec();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel
      .findById(id, { isArchived: false })
      .populate('organizer', 'firstName lastName email')
      .populate('interests', 'category description')
      .exec();

    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<Event> {
    const event = await this.eventModel.findById(id, { isArchived: false });
    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }

    if (event.organizer.toString() !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can update this event',
      );
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .populate('organizer', 'firstName lastName email')
      .populate('interests', 'category description')
      .exec();

    if (!updatedEvent) {
      throw new NotFoundException(`Event #${id} not found`);
    }

    return updatedEvent;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const event = await this.eventModel.findById(id, { isArchived: false });
    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }

    if (event.organizer.toString() !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can delete this event',
      );
    }

    await this.eventModel.findByIdAndUpdate(id, { isArchived: true });

    // await this.eventModel.findByIdAndDelete(id);

    return { message: 'Event deleted successfully' };
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return this.eventModel
      .find({ organizer: organizerId, isArchived: false })
      .populate('interests', 'category description')
      .exec();
  }
}
