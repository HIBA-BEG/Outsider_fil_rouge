import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async registerForEvent(eventId: string, userId: string): Promise<Event> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.registeredUsers.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('User already registered for this event');
    }

    if (event.registeredUsers.length >= event.maxParticipants) {
      throw new ForbiddenException('Event is already full');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.PARTICIPANT) {
      throw new ForbiddenException('Only participants can register for events');
    }

    if (new Date(event.startDate) < new Date()) {
      throw new ForbiddenException('Cannot register for past events');
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $push: { registeredUsers: userId },
        },
        { new: true },
      )
      .populate('organizer', 'firstName lastName email')
      .populate('interests', 'category description');

    if (!updatedEvent) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $push: { registeredEvents: eventId },
    });

    return updatedEvent;
  }

  async getRegisteredEvents(userId: string): Promise<Event[]> {
    return this.eventModel
      .find({
        registeredUsers: userId,
        isArchived: false,
      })
      .populate('organizer', 'firstName lastName email')
      .populate('interests', 'category description')
      .exec();
  }

  async getAvailableSpots(eventId: string): Promise<number> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event.maxParticipants - event.registeredUsers.length;
  }
  
}
