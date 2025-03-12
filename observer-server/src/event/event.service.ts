import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User, UserRole } from '../user/entities/user.entity';
import { extname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from 'src/types/file-upload.interface';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string, files: FileUpload[]): Promise<Event> {
    if (!files || files.length === 0) {
      throw new Error('At least one image is required');
    }

    const imageUrls = await Promise.all(
      files.map(file => this.uploadEventImage(file))
    );

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
      poster: imageUrls,
    });

    const savedEvent = await event.save();

    await this.userModel.findByIdAndUpdate(userId, {
      $push: { createdEvents: savedEvent._id },
    });

    return savedEvent;
  }

  
  async uploadEventImage(file: FileUpload): Promise<string> {
    try {
      console.log('File details:', {
        mimetype: file.mimetype,
        originalname: file.originalname,
        // size: file.size
      });

      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
        );
      }

      const uploadDir = join(process.cwd(), 'uploads-event');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
      }

      const fileExt = extname(file.originalname || '.jpg');
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, file.buffer);
      console.log('Service: File written successfully:', filePath);
      const serverUrl = process.env.SERVER_URL;
      console.log('Generated image URL:', `${serverUrl}/uploads-event/${fileName}`);
      return `${serverUrl}/uploads-event/${fileName}`;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel
      .find({ isArchived: false })
      .populate('organizer', 'firstName lastName email')
      .populate('interests', 'category description')
      .populate({
        path: 'city',
        model: 'City',
        select: 'name admin_name',
      });     
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel
      .findById(id, { isArchived: false })
      .populate('organizer', 'firstName lastName email')
      .populate('interests', 'category description')
      .populate({
        path: 'city',
        model: 'City',
        select: 'name admin_name',
      });
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

  async cancelRegistration(eventId: string, userId: string): Promise<Event> {
    // console.log('cancelRegistration eventId', eventId);
    // console.log('cancelRegistration userId', userId);
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // console.log('Event registeredUsers:', event.registeredUsers);

    const isRegistered = event.registeredUsers.some(
      (id) => id.toString() === userId,
    );
    //.some() is a method that checks if at least one element in the array satisfies the condition w it returns true or false

    // console.log('Is registered:', isRegistered);

    if (!isRegistered) {
      throw new ForbiddenException('User is not registered for this event');
    }

    // the user can cancel the registration 24 hours before the event :) hihihi
    // NB: I should add an alert of a visual notification before making the reservation that he can cancel it 24 hours/ 2 full days before the event
    const HoursBeforeEvent = new Date(event.startDate);
    HoursBeforeEvent.setHours(HoursBeforeEvent.getHours() - 48);

    if (new Date() > HoursBeforeEvent) {
      throw new ForbiddenException(
        'Cannot cancel registration less than 48 hours before event',
      );
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $pull: { registeredUsers: userId },
        },
        { new: true },
      )
      .populate('organizer', 'firstName lastName email')
      .populate('interests', 'category description');

    // console.log('Cancel registration updatedEvent', updatedEvent);
    // console.log('Cancel registration userId', userId);
    if (!updatedEvent) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { registeredEvents: eventId },
    });

    return updatedEvent;
  }

  async getPersonalizedEvents(userId: string): Promise<Event[]> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userInterestIds = user.interests.map((id) => id.toString());

    const query = {
      isArchived: false,
      // startDate: { $gt: new Date() }, //greater than today
      city: user.city,
      $or: [
        { interests: { $in: userInterestIds } },
        { interests: { $exists: true } }
      ],
    };

    const events = await this.eventModel
      .find(query)
      .populate('organizer', 'firstName lastName email')
      .populate('interests', 'category description')
      .sort({ startDate: 1 })
      .exec();

    if (!events.length) {
      console.log('No personalized events found');
    }

    // console.log('User interests:', userInterestIds);
    // console.log('Events found:', events.length);
    // events.forEach((e) => console.log('Event interests:', e.interests));

    return events;
  }
}
