import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { getModelToken } from '@nestjs/mongoose';
import { Event } from './entities/event.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Types } from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FileUpload } from '../types/file-upload.interface';

describe('EventService', () => {
  let service: EventService;

  const mockEventModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
  };

  function MockEventModel(dto: any) {
    return {
      ...dto,
      save: jest.fn().mockResolvedValue(dto),
    };
  }

  MockEventModel.find = mockEventModel.find;
  MockEventModel.findById = mockEventModel.findById;
  MockEventModel.findByIdAndUpdate = mockEventModel.findByIdAndUpdate;
  MockEventModel.create = mockEventModel.create;

  const mockUserModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const organizerId = '67c0d99afb341de127df5555';
  const userId = new Types.ObjectId().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getModelToken(Event.name),
          useValue: MockEventModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);

    jest
      .spyOn(service, 'uploadEventImage')
      .mockImplementation(async (file: FileUpload) => {
        return `/uploads-event/mock-${file.originalname}`;
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockFile: FileUpload = {
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
      originalname: 'test.jpg',
    };

    const createEventDto = {
      title: 'Photography Event',
      description: 'Photography Description',
      startDate: new Date('2025-03-21T03:25:15.045Z'),
      endDate: new Date('2025-03-21T03:25:15.045Z'),
      location: 'Rabat center',
      maxParticipants: 100,
      price: 10,
      isPublic: true,
      city: '67c0d99afb341de127df5789',
      interests: ['67dab46117900c215ff82be2'],
    };

    it('should throw error if no images provided', async () => {
      await expect(
        service.create(createEventDto, organizerId, []),
      ).rejects.toThrow('At least one image is required');
    });

    it('should throw error if user is not an organizer', async () => {
      const mockUser = {
        _id: userId,
        role: UserRole.PARTICIPANT,
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      await expect(
        service.create(createEventDto, userId, [mockFile]),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return all non-archived events', async () => {
      const mockEvents = [
        { id: '1', title: 'Event 1' },
        { id: '2', title: 'Event 2' },
      ];

      mockEventModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockEvents),
          }),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockEvents);
      expect(mockEventModel.find).toHaveBeenCalledWith({ isArchived: false });
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      const mockEvent = { id: '1', title: 'Event 1' };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockEvent),
          }),
        }),
      });

      const result = await service.findOne('1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('registerForEvent', () => {
    it('should register user for event successfully', async () => {
      const eventId = new Types.ObjectId().toString();

      const mockEvent = {
        _id: eventId,
        registeredUsers: [],
        maxParticipants: 10,
        startDate: new Date(Date.now() + 86400000),
      };

      const mockUser = {
        _id: userId,
        role: UserRole.PARTICIPANT,
      };

      mockEventModel.findById.mockResolvedValue(mockEvent);
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockEventModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockEvent),
        }),
      });

      await service.registerForEvent(eventId, userId);

      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        eventId,
        {
          $push: { registeredUsers: userId },
        },
        { new: true },
      );
    });

    it('should throw error if event is full', async () => {
      const validId = new Types.ObjectId().toString();
      const mockEvent = {
        registeredUsers: Array(10).fill(validId),
        maxParticipants: 10,
        startDate: new Date(Date.now() + 86400000),
      };

      mockEventModel.findById.mockResolvedValue(mockEvent);

      await expect(service.registerForEvent(validId, validId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('cancelRegistration', () => {
    it('should cancel registration successfully', async () => {
      const eventId = new Types.ObjectId().toString();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const mockEvent = {
        _id: eventId,
        registeredUsers: [userId],
        startDate: futureDate,
      };

      mockEventModel.findById.mockResolvedValue(mockEvent);
      mockEventModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockEvent),
        }),
      });

      await service.cancelRegistration(eventId, userId);

      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        eventId,
        {
          $pull: { registeredUsers: userId },
        },
        { new: true },
      );
    });

    it('should throw error if cancellation is too close to event start', async () => {
      const mockEvent = {
        registeredUsers: ['userId'],
        startDate: new Date(Date.now() + 3600000),
      };

      mockEventModel.findById.mockResolvedValue(mockEvent);

      await expect(
        service.cancelRegistration('eventId', 'userId'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPersonalizedEvents', () => {
    it('should return personalized events based on user interests and city', async () => {
      const mockUser = {
        _id: userId,
        interests: ['music', 'art'],
        city: 'Test City',
      };

      const mockEvents = [
        { id: '67c0d99afb341de127df5ui9', title: 'Music Event' },
        { id: '67c0d99afb341de127df55de', title: 'Art Exhibition' },
      ];

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockEventModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockEvents),
            }),
          }),
        }),
      });

      const result = await service.getPersonalizedEvents(userId);
      expect(result).toEqual(mockEvents);
    });
  });
});
